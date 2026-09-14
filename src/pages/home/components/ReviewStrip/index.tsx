import { SimpleTooltip } from "@/components/SimpleTooltip";
import { Button } from "@/components/ui/button";
import { STORAGE_KEY } from "@/constants";
import { useReviewConfig } from "@/contexts/ReviewConfigContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { ReviewCardStyle, ReviewFilter, TopicItem, VocabularyItem } from "@/types";
import { pickReviewWords } from "@/utils";
import { keyBy } from "lodash";
import {
  ChevronDown,
  ChevronUp,
  Palette,
  Pause,
  Play,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ReviewFilterModal, ReviewFilterPatch } from "./ReviewFilterModal";
import { ReviewMiniCard } from "./ReviewMiniCard";
import { ReviewStyleModal } from "./ReviewStyleModal";

interface ReviewStripProps {
  allWords: VocabularyItem[];
  topics: TopicItem[];
  isLoaded: boolean;
  onUpdateWord: (id: string, updates: Partial<VocabularyItem>) => void;
  onDeleteWord: (id: string) => void;
  onOpenInVocabulary: (item: VocabularyItem) => void;
  onAddToSession: (item: VocabularyItem) => void;
  /** true khi khu này nằm trong panel có thể resize (chiếm hết chiều cao được cấp,
   * card bên trong co giãn theo). Mặc định false = giữ chiều cao tự nhiên như cũ. */
  fillHeight?: boolean;
  /** Báo ra ngoài mỗi khi trạng thái thu gọn đổi, để panel bọc ngoài (nếu có)
   * tự co/giãn chiều cao theo cho khớp thay vì giữ nguyên khoảng trống. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Trạng thái collapse thực tế của panel bọc ngoài (nếu có) - dùng để đồng
   * bộ ngược lại: kéo tay panel xuống dưới minSize cũng tự collapse (theo cơ
   * chế `collapsible` của thư viện), nút/hàng card ở đây phải cập nhật theo. */
  panelCollapsed?: boolean;
}

// Card "gốc" cao CARD_HEIGHT (xem ReviewMiniCard) - dùng làm mốc quy đổi scale
// theo chiều cao thực tế đang có khi khu Quick Review được resize.
const BASE_CARD_ROW_HEIGHT = 112;
const MIN_CARD_SCALE = 0.72;
const MAX_CARD_SCALE = 1.55;

export const ReviewStrip: React.FC<ReviewStripProps> = ({
  allWords,
  topics,
  isLoaded,
  onUpdateWord,
  onDeleteWord,
  onOpenInVocabulary,
  onAddToSession,
  fillHeight = false,
  onCollapsedChange,
  panelCollapsed,
}) => {
  const { t } = useTranslation("home");
  const { getStorage, setStorage, hasValue } = useLocalStorage();
  const { config, loading: configLoading, setConfig } = useReviewConfig();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() =>
    hasValue(STORAGE_KEY.HOME_REVIEW_COLLAPSED)
      ? !!getStorage(STORAGE_KEY.HOME_REVIEW_COLLAPSED)
      : // Mobile ít không gian dọc -> mặc định thu gọn.
        typeof window !== "undefined" && window.innerWidth < 768,
  );
  const [isPaused, setIsPaused] = useState(false);
  // Tạm dừng "mềm" (không đổi trạng thái nút Play/Pause) khi đang hover 1 card
  // hoặc đang mở tooltip/detail của nó - không tính vào lần đếm ngược.
  const [isHoveringCards, setIsHoveringCards] = useState(false);
  const [openDetailCount, setOpenDetailCount] = useState(0);
  const isInteracting = isHoveringCards || openDetailCount > 0;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [cardScale, setCardScale] = useState(1);
  const cardRowObserverRef = useRef<ResizeObserver | null>(null);

  // fillHeight (nằm trong panel resize được) -> đo chiều cao thực tế còn lại
  // của hàng card, quy đổi thành hệ số scale để card co giãn theo (trong giới
  // hạn MIN/MAX để không quá nhỏ/quá to). Dùng callback ref (thay vì useRef +
  // useEffect chạy 1 lần) vì hàng card bị unmount/mount lại mỗi khi thu gọn/mở
  // rộng (isCollapsed) - phải gắn lại ResizeObserver mỗi lần mount mới thì mới
  // luôn theo dõi đúng phần tử đang hiển thị.
  const setCardRowRef = useCallback(
    (el: HTMLDivElement | null) => {
      cardRowObserverRef.current?.disconnect();
      cardRowObserverRef.current = null;
      if (!fillHeight) {
        setCardScale(1);
        return;
      }
      if (!el) return;
      const update = () => {
        const h = el.clientHeight;
        if (!h) return;
        setCardScale(
          Math.min(
            MAX_CARD_SCALE,
            Math.max(MIN_CARD_SCALE, h / BASE_CARD_ROW_HEIGHT),
          ),
        );
      };
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      cardRowObserverRef.current = ro;
    },
    [fillHeight],
  );

  // Báo trạng thái thu gọn ra ngoài để panel bọc (nếu có) tự co/giãn theo.
  useEffect(() => {
    onCollapsedChange?.(isCollapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCollapsed]);

  // Chiều ngược lại: panel bị kéo tay xuống dưới minSize thì tự collapse
  // (cơ chế `collapsible` của thư viện) mà không qua nút bấm ở đây -> đồng bộ
  // lại state để nút/hàng card khớp với kích thước panel thực tế.
  useEffect(() => {
    if (panelCollapsed === undefined) return;
    setIsCollapsed((prev) => (prev === panelCollapsed ? prev : panelCollapsed));
  }, [panelCollapsed]);

  // Bộ lọc/số giây/số card "áp dụng tạm" cho phiên hiện tại - không lưu DB,
  // tắt trang hoặc load lại là mất, quay về đúng config đã lưu.
  const [sessionOverride, setSessionOverride] =
    useState<ReviewFilterPatch | null>(null);

  const effectiveConfig = useMemo(
    () => (sessionOverride ? { ...config, ...sessionOverride } : config),
    [config, sessionOverride],
  );

  const hasPicked = useRef(false);
  const prevFilterRef = useRef<ReviewFilter>(effectiveConfig.filter);
  const prevCardCountRef = useRef(effectiveConfig.cardCount);
  const remainingMsRef = useRef(effectiveConfig.intervalSeconds * 1000);

  useEffect(() => {
    setStorage(STORAGE_KEY.HOME_REVIEW_COLLAPSED, isCollapsed);
  }, [isCollapsed, setStorage]);

  const wordMap = useMemo(() => keyBy(allWords, "id"), [allWords]);
  const topicMap = useMemo(() => keyBy(topics, "id"), [topics]);

  const refreshWords = useCallback(() => {
    setReviewIds((prevIds) =>
      pickReviewWords(
        allWords,
        effectiveConfig.cardCount,
        new Set(prevIds),
        effectiveConfig.filter,
      ).map((w) => w.id),
    );
  }, [allWords, effectiveConfig.cardCount, effectiveConfig.filter]);

  const resetCountdown = useCallback(() => {
    remainingMsRef.current = effectiveConfig.intervalSeconds * 1000;
    setProgress(0);
  }, [effectiveConfig.intervalSeconds]);

  // Chọn bộ từ ban đầu khi config + kho từ đã sẵn sàng, và chọn lại mỗi khi
  // filter/số card thay đổi (lưu chính thức hoặc áp dụng tạm). Sửa/đánh dấu đã
  // thuộc không làm nhảy danh sách vì chỉ so sánh reference của filter + cardCount.
  useEffect(() => {
    if (configLoading || !isLoaded || !allWords.length) return;
    const filterChanged = prevFilterRef.current !== effectiveConfig.filter;
    const countChanged = prevCardCountRef.current !== effectiveConfig.cardCount;
    if (hasPicked.current && !filterChanged && !countChanged) return;
    prevFilterRef.current = effectiveConfig.filter;
    prevCardCountRef.current = effectiveConfig.cardCount;
    hasPicked.current = true;
    setReviewIds(
      pickReviewWords(
        allWords,
        effectiveConfig.cardCount,
        undefined,
        effectiveConfig.filter,
      ).map((w) => w.id),
    );
    resetCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    configLoading,
    isLoaded,
    allWords,
    effectiveConfig.filter,
    effectiveConfig.cardCount,
  ]);

  // Đổi số giây đếm ngược -> khởi động lại đồng hồ ngay.
  useEffect(() => {
    resetCountdown();
  }, [resetCountdown]);

  // Vòng đếm ngược tự làm mới, chạy mỗi 200ms dựa trên thời gian thực còn lại.
  // Tạm dừng khi user bấm nút Pause, hoặc đang hover/xem chi tiết 1 card.
  useEffect(() => {
    if (isPaused || isInteracting || configLoading || !reviewIds.length) return;
    const TICK_MS = 200;
    const id = window.setInterval(() => {
      remainingMsRef.current -= TICK_MS;
      if (remainingMsRef.current <= 0) {
        refreshWords();
        remainingMsRef.current = effectiveConfig.intervalSeconds * 1000;
      }
      const total = effectiveConfig.intervalSeconds * 1000;
      setProgress(Math.max(0, Math.min(1, 1 - remainingMsRef.current / total)));
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [
    isPaused,
    isInteracting,
    configLoading,
    reviewIds.length,
    effectiveConfig.intervalSeconds,
    refreshWords,
  ]);

  const handleManualRefresh = () => {
    refreshWords();
    resetCountdown();
  };

  const handleSaveFilter = (patch: ReviewFilterPatch) => {
    setSessionOverride(null);
    setConfig({ ...config, ...patch });
  };

  const handleApplyTemporaryFilter = (patch: ReviewFilterPatch) => {
    setSessionOverride(patch);
  };

  const handleSaveStyle = (style: ReviewCardStyle) => {
    setConfig({ ...config, style });
  };

  const handleDetailOpenChange = (open: boolean) => {
    setOpenDetailCount((c) => Math.max(0, c + (open ? 1 : -1)));
  };

  const reviewWords = useMemo(
    () =>
      reviewIds
        .map((id) => wordMap[id])
        .filter((w): w is VocabularyItem => !!w),
    [reviewIds, wordMap],
  );

  // Kho từ rỗng thì không chiếm chỗ của khu học chính.
  if (isLoaded && !allWords.length) return null;

  return (
    <div
      className={cn(
        "border rounded-lg bg-card/60 backdrop-blur overflow-hidden",
        fillHeight ? "h-full flex flex-col" : "shrink-0",
      )}
    >
      {/* --- HEADER --- */}
      <div className="flex items-center gap-1.5 px-2 h-8 shrink-0">
        <Sparkles size={14} className="text-primary shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
          {t("review.title")}
        </span>
        {!!reviewWords.length && (
          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
            {reviewWords.length}
          </span>
        )}
        {sessionOverride && (
          <SimpleTooltip content={t("review.filter.applyTempHint")}>
            <span className="flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
              <Zap size={9} /> {t("review.filter.applyTemp")}
            </span>
          </SimpleTooltip>
        )}
        <SimpleTooltip content={isPaused ? t("review.resume") : t("review.pause")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPaused((p) => !p)}
            disabled={!reviewWords.length}
            className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
          >
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
          </Button>
        </SimpleTooltip>
        <SimpleTooltip content={t("review.refresh")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleManualRefresh}
            disabled={!allWords.length}
            className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
          >
            <RefreshCw size={13} />
          </Button>
        </SimpleTooltip>

        <div className="ml-auto flex items-center gap-0.5 shrink-0">
          <SimpleTooltip content={t("review.style.title")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsStyleOpen(true)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <Palette size={13} />
            </Button>
          </SimpleTooltip>
          <SimpleTooltip content={t("review.filterButton")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFilterOpen(true)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <SlidersHorizontal size={13} />
            </Button>
          </SimpleTooltip>
          <SimpleTooltip
            content={isCollapsed ? t("review.expand") : t("review.collapse")}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          </SimpleTooltip>
        </div>
      </div>

      {/* --- THANH ĐẾM NGƯỢC TỰ LÀM MỚI --- */}
      {!isCollapsed && (
        <div className="h-[3px] w-full bg-muted/50 shrink-0">
          <div
            className={cn(
              "h-full bg-primary/70 transition-[width] duration-200 ease-linear",
              (isPaused || isInteracting) && "opacity-40",
            )}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* --- DÃY CARD (canh giữa; nếu tràn thì cuộn ngang như bình thường) --- */}
      {!isCollapsed && (
        <div
          className={cn(
            "flex justify-center px-2 pt-1.5 pb-2",
            fillHeight && "flex-1 min-h-0",
          )}
        >
          <div
            ref={setCardRowRef}
            className={cn(
              "flex items-center gap-2 max-w-full overflow-x-auto overflow-y-hidden scrollbar-thin",
              fillHeight && "h-full",
            )}
            onMouseEnter={() => setIsHoveringCards(true)}
            onMouseLeave={() => setIsHoveringCards(false)}
          >
            {reviewWords.length ? (
              reviewWords.map((item) => (
                <ReviewMiniCard
                  key={item.id}
                  item={item}
                  topic={item.topicId ? topicMap[item.topicId] : undefined}
                  style={config.style}
                  onUpdate={onUpdateWord}
                  onDelete={onDeleteWord}
                  onOpenInVocabulary={onOpenInVocabulary}
                  onAddToSession={onAddToSession}
                  onDetailOpenChange={handleDetailOpenChange}
                  scale={fillHeight ? cardScale : 1}
                />
              ))
            ) : (
              <div className="h-[92px] w-[80vw] max-w-md flex items-center justify-center text-xs text-muted-foreground">
                {t("review.empty")}
              </div>
            )}
          </div>
        </div>
      )}

      <ReviewFilterModal
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        allWords={allWords}
        config={effectiveConfig}
        onSave={handleSaveFilter}
        onApplyTemporary={handleApplyTemporaryFilter}
      />

      <ReviewStyleModal
        open={isStyleOpen}
        onOpenChange={setIsStyleOpen}
        style={config.style}
        onSave={handleSaveStyle}
      />
    </div>
  );
};
