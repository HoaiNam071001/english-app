import { CommonModal } from "@/components/CommonModal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  DEFAULT_REVIEW_FILTER,
  PartOfSpeech,
  REVIEW_CARD_COUNT_MAX,
  REVIEW_CARD_COUNT_MIN,
  REVIEW_INTERVAL_MAX,
  REVIEW_INTERVAL_MIN,
  ReviewConfig,
  ReviewFilter,
  ReviewImageFilter,
  VocabularyItem,
} from "@/types";
import { applyReviewFilter, getReviewDateBounds } from "@/utils";
import { Clock3, Image, ImageOff, Images, RotateCcw, Zap } from "lucide-react";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PartOfSpeechSelector from "../common/PartOfSpeechSelector";
import { TopicsMultiSelector } from "../common/TopicsMultiSelector";
import WordTypeSelector from "../common/WordTypeSelector";

/** Phần của ReviewConfig mà modal này chỉnh sửa (không đụng tới `style`). */
export type ReviewFilterPatch = Pick<
  ReviewConfig,
  "intervalSeconds" | "cardCount" | "filter"
>;

interface ReviewFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allWords: VocabularyItem[];
  config: ReviewConfig;
  /** Lưu lâu dài vào DB/localStorage, dùng lại cho lần vào web sau. */
  onSave: (patch: ReviewFilterPatch) => void;
  /** Chỉ áp dụng cho phiên hiện tại (tab này) - tắt trang đi là mất, không lưu lại. */
  onApplyTemporary: (patch: ReviewFilterPatch) => void;
}

const IMAGE_OPTIONS: { value: ReviewImageFilter; icon: React.ReactNode }[] = [
  { value: "all", icon: <Images size={13} /> },
  { value: "has", icon: <Image size={13} /> },
  { value: "none", icon: <ImageOff size={13} /> },
];

const INTERVAL_PRESETS = [15, 30, 60, 120];
const CARD_COUNT_PRESETS = [5, 10, 15, 20];
const DAY_MS = 24 * 60 * 60 * 1000;

// Input type="date" chỉ nhận/ trả "YYYY-MM-DD".
const toDateInputValue = (ts?: number) =>
  ts ? moment(ts).format("YYYY-MM-DD") : "";
const fromDateInputStart = (val: string) =>
  val ? moment(val, "YYYY-MM-DD").startOf("day").valueOf() : undefined;
const fromDateInputEnd = (val: string) =>
  val ? moment(val, "YYYY-MM-DD").endOf("day").valueOf() : undefined;

export const ReviewFilterModal: React.FC<ReviewFilterModalProps> = ({
  open,
  onOpenChange,
  allWords,
  config,
  onSave,
  onApplyTemporary,
}) => {
  const { t } = useTranslation(["home", "common"]);
  const [intervalSeconds, setIntervalSeconds] = useState(config.intervalSeconds);
  const [cardCount, setCardCount] = useState(config.cardCount);
  const [filter, setFilter] = useState<ReviewFilter>(config.filter);

  useEffect(() => {
    if (open) {
      setIntervalSeconds(config.intervalSeconds);
      setCardCount(config.cardCount);
      setFilter(config.filter);
    }
  }, [open, config]);

  // Khoảng ngày các từ được thêm vào - đúng bằng ngày hiển thị ở danh sách từ vựng bên sidebar.
  const dateBounds = useMemo(() => getReviewDateBounds(allWords), [allWords]);
  const dayBounds = useMemo(() => {
    if (!dateBounds) return null;
    return {
      min: moment(dateBounds.min).startOf("day").valueOf(),
      max: moment(dateBounds.max).startOf("day").valueOf(),
    };
  }, [dateBounds]);

  const dateSliderValue = useMemo((): [number, number] => {
    if (!dayBounds) return [0, 0];
    const lo = filter.dateRange.start
      ? moment(filter.dateRange.start).startOf("day").valueOf()
      : dayBounds.min;
    const hi = filter.dateRange.end
      ? moment(filter.dateRange.end).startOf("day").valueOf()
      : dayBounds.max;
    return [lo, hi];
  }, [filter.dateRange, dayBounds]);

  const handleDateSliderChange = ([lo, hi]: [number, number]) => {
    setFilter((prev) => ({
      ...prev,
      dateRange: { start: lo, end: moment(hi).endOf("day").valueOf() },
    }));
  };

  const matchCount = useMemo(
    () => applyReviewFilter(allWords, filter).length,
    [allWords, filter],
  );

  const patchFilter = (updates: Partial<ReviewFilter>) =>
    setFilter((prev) => ({ ...prev, ...updates }));

  const handleReset = () => {
    setIntervalSeconds(30);
    setCardCount(10);
    setFilter(DEFAULT_REVIEW_FILTER);
  };

  const buildPatch = (): ReviewFilterPatch => ({
    intervalSeconds: Math.min(
      REVIEW_INTERVAL_MAX,
      Math.max(REVIEW_INTERVAL_MIN, Number(intervalSeconds) || 30),
    ),
    cardCount: Math.min(
      REVIEW_CARD_COUNT_MAX,
      Math.max(REVIEW_CARD_COUNT_MIN, Number(cardCount) || 10),
    ),
    filter,
  });

  const handleSave = () => {
    onSave(buildPatch());
    onOpenChange(false);
  };

  const handleApplyTemporary = () => {
    onApplyTemporary(buildPatch());
    onOpenChange(false);
  };

  return (
    <CommonModal
      open={open}
      onOpenChange={onOpenChange}
      title={t("review.filter.title")}
      contentClassName="w-full max-h-[75vh] overflow-y-auto"
      footer={
        <DialogFooter className="gap-2 sm:gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common:actions.cancel")}
          </Button>
          <Button
            variant="secondary"
            onClick={handleApplyTemporary}
            className="gap-1.5"
          >
            <Zap size={14} /> {t("review.filter.applyTemp")}
          </Button>
          <Button onClick={handleSave}>{t("common:actions.save")}</Button>
        </DialogFooter>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2 px-1 pb-1">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t("review.filter.applyTempHint")}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
            onClick={handleReset}
          >
            <RotateCcw size={12} /> {t("review.filter.reset")}
          </Button>
        </div>

        {/* --- SỐ GIÂY TỰ LÀM MỚI + SỐ CARD MỖI LẦN --- */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1.5">
                <Clock3 size={12} /> {t("review.filter.interval")}
              </Label>
              <span className="text-xs font-semibold text-primary tabular-nums">
                {intervalSeconds}s
              </span>
            </div>
            <input
              type="range"
              min={REVIEW_INTERVAL_MIN}
              max={REVIEW_INTERVAL_MAX}
              step={5}
              value={intervalSeconds}
              onChange={(e) => setIntervalSeconds(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5">
              {INTERVAL_PRESETS.map((sec) => (
                <Button
                  key={sec}
                  type="button"
                  size="sm"
                  variant={intervalSeconds === sec ? "default" : "outline"}
                  className="h-6 px-2 text-[11px]"
                  onClick={() => setIntervalSeconds(sec)}
                >
                  {sec}s
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">{t("review.filter.cardCount")}</Label>
              <span className="text-xs font-semibold text-primary tabular-nums">
                {cardCount}
              </span>
            </div>
            <input
              type="range"
              min={REVIEW_CARD_COUNT_MIN}
              max={REVIEW_CARD_COUNT_MAX}
              step={1}
              value={cardCount}
              onChange={(e) => setCardCount(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5">
              {CARD_COUNT_PRESETS.map((n) => (
                <Button
                  key={n}
                  type="button"
                  size="sm"
                  variant={cardCount === n ? "default" : "outline"}
                  className="h-6 px-2 text-[11px]"
                  onClick={() => setCardCount(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* --- ẢNH --- */}
        <div className="space-y-1.5">
          <Label className="text-xs">{t("review.filter.image")}</Label>
          <div className="flex items-center bg-muted/50 rounded-md p-0.5 border w-fit">
            {IMAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => patchFilter({ image: opt.value })}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 h-7 rounded text-xs font-medium transition-colors",
                  filter.image === opt.value
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.icon}
                {t(`review.filter.image_${opt.value}`)}
              </button>
            ))}
          </div>
        </div>

        {/* --- CHỦ ĐỀ --- */}
        <div className="space-y-1.5">
          <Label className="text-xs">{t("review.filter.topics")}</Label>
          <TopicsMultiSelector
            value={filter.topicIds}
            onChange={(ids) => patchFilter({ topicIds: ids })}
          />
        </div>

        {/* --- LOẠI TỪ + TỪ LOẠI --- */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t("review.filter.wordTypes")}</Label>
            <WordTypeSelector
              value={filter.wordTypeIds}
              onChange={(ids) => patchFilter({ wordTypeIds: ids })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">{t("review.filter.partOfSpeech")}</Label>
            <PartOfSpeechSelector
              value={filter.partOfSpeech}
              onChange={(pos: PartOfSpeech[]) =>
                patchFilter({ partOfSpeech: pos })
              }
            />
          </div>
        </div>

        {/* --- DATE RANGE: ngày thêm từ, trùng ngày hiển thị bên danh sách từ vựng --- */}
        <div className="space-y-1.5">
          <Label className="text-xs">{t("review.filter.dateRange")}</Label>
          <p className="text-[11px] text-muted-foreground">
            {t("review.filter.dateRangeHint")}
          </p>

          {dayBounds && dayBounds.min !== dayBounds.max && (
            <DualRangeSlider
              min={dayBounds.min}
              max={dayBounds.max}
              step={DAY_MS}
              value={dateSliderValue}
              onChange={handleDateSliderChange}
              formatLabel={(v) => moment(v).format("DD/MM/YYYY")}
              className="pt-2 pb-1"
            />
          )}

          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-[10px] text-muted-foreground">
                {t("review.filter.dateFrom")}
              </Label>
              <Input
                type="date"
                className="h-8 text-xs"
                value={toDateInputValue(filter.dateRange.start)}
                min={dateBounds ? toDateInputValue(dateBounds.min) : undefined}
                max={dateBounds ? toDateInputValue(dateBounds.max) : undefined}
                onChange={(e) =>
                  patchFilter({
                    dateRange: {
                      ...filter.dateRange,
                      start: fromDateInputStart(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-[10px] text-muted-foreground">
                {t("review.filter.dateTo")}
              </Label>
              <Input
                type="date"
                className="h-8 text-xs"
                value={toDateInputValue(filter.dateRange.end)}
                min={dateBounds ? toDateInputValue(dateBounds.min) : undefined}
                max={dateBounds ? toDateInputValue(dateBounds.max) : undefined}
                onChange={(e) =>
                  patchFilter({
                    dateRange: {
                      ...filter.dateRange,
                      end: fromDateInputEnd(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* --- SỐ TỪ PHÙ HỢP --- */}
        <div className="text-xs text-center text-muted-foreground bg-muted/40 rounded-md py-1.5 border">
          {t("review.filter.matchCount", { count: matchCount })}
        </div>
      </div>
    </CommonModal>
  );
};
