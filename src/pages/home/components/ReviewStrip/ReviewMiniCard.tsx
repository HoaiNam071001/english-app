import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TOPIC_COLORS, TopicColor } from "@/constants";
import { useWordTypes } from "@/hooks/useWordTypes";
import { cn } from "@/lib/utils";
import {
  AccentType,
  ReviewCardDetailField,
  ReviewCardStyle,
  TopicItem,
  VocabularyItem,
} from "@/types";
import {
  getColorStyle,
  getPartOfSpeechSolidStyle,
  getShortPartOfSpeech,
  playAudio,
} from "@/utils";
import {
  Check,
  ListPlus,
  PenLine,
  SquareArrowOutUpRight,
  Volume2,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditVocabularyModal } from "../common/EditVocabularyModal";
import { Phonetics } from "../common/Phonetic";
import { VocabularyDetailPopup } from "../common/VocabularyDetailPopup";

interface ReviewMiniCardProps {
  item: VocabularyItem;
  topic?: TopicItem;
  style: ReviewCardStyle;
  onUpdate: (id: string, updates: Partial<VocabularyItem>) => void;
  onDelete: (id: string) => void;
  onOpenInVocabulary: (item: VocabularyItem) => void;
  onAddToSession: (item: VocabularyItem) => void;
  /** Báo ra ngoài khi tooltip/detail của card này mở hoặc đóng (để tạm dừng auto-refresh). */
  onDetailOpenChange?: (open: boolean) => void;
}

// Chọn 1 màu trong danh sách theo hash của chữ, để cùng 1 từ luôn ra cùng 1 màu.
const hashPick = (text: string, list: TopicColor[]) => {
  if (!list.length) return TOPIC_COLORS[0];
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return list[Math.abs(hash) % list.length];
};

const getCardPalette = (
  item: VocabularyItem,
  topic: TopicItem | undefined,
  style: ReviewCardStyle,
): TopicColor => {
  if (style.colorMode === "topic" && topic) {
    return getColorStyle(topic.color);
  }
  if (style.colorMode === "custom" && style.customColorIds.length) {
    const list = TOPIC_COLORS.filter((c) =>
      style.customColorIds.includes(c.id),
    );
    return hashPick(item.text || item.id, list);
  }
  return hashPick(item.text || item.id, TOPIC_COLORS);
};

// Cùng kích cỡ cho mọi icon-button ở góc card.
const iconBtnClass =
  "rounded-full bg-background/85 text-foreground p-1 shadow-sm backdrop-blur-sm border border-border/40 hover:bg-background transition-colors";

// Chiều cao cố định cho mọi card (dù có ảnh hay không, chọn bao nhiêu field) để
// hàng card luôn thẳng hàng, không bị "loang lổ" do mỗi card một chiều cao khác nhau.
const CARD_HEIGHT = 112;

export const ReviewMiniCard: React.FC<ReviewMiniCardProps> = ({
  item,
  topic,
  style,
  onUpdate,
  onDelete,
  onOpenInVocabulary,
  onAddToSession,
  onDetailOpenChange,
}) => {
  const { t } = useTranslation("home");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { getTypesByIds } = useWordTypes();
  const palette = useMemo(
    () => getCardPalette(item, topic, style),
    [item, topic, style],
  );
  const wordTypes = useMemo(
    () => getTypesByIds(item.typeIds),
    [getTypesByIds, item.typeIds],
  );

  const showImage = style.showImage && !!item.imageUrl;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audioSource =
      item.phonetics?.find((p) => p.audio && p.accent === AccentType.US) ||
      item.phonetics?.find((p) => p.audio);
    playAudio(audioSource?.audio, item.text, audioSource?.accent);
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const renderDetailField = (field: ReviewCardDetailField) => {
    switch (field) {
      case "meaning":
        return (
          <div
            key={field}
            className={cn(
              "relative w-full text-[9px] italic truncate opacity-90",
              !showImage && palette.text,
            )}
          >
            {item.meaning}
          </div>
        );
      case "phonetics":
        return (
          <Phonetics
            key={field}
            item={item}
            className={cn(
              "relative text-[9px] truncate max-w-full opacity-90",
              !showImage && palette.text,
            )}
          />
        );
      case "partOfSpeech":
        // Chỉ hiện tối đa 2 badge trên 1 dòng - tránh card cao thấp lệch nhau
        // khi từ có nhiều từ loại (loang lổ hàng card).
        return item.partOfSpeech?.length ? (
          <div key={field} className="flex items-center gap-0.5 max-w-full overflow-hidden">
            {item.partOfSpeech.slice(0, 2).map((pos) => (
              <span
                key={pos}
                className={cn(
                  "px-1 h-3.5 shrink-0 rounded-sm text-[7px] font-bold uppercase tracking-tighter leading-none flex items-center",
                  getPartOfSpeechSolidStyle(pos),
                )}
              >
                {getShortPartOfSpeech(pos)}
              </span>
            ))}
            {item.partOfSpeech.length > 2 && (
              <span className="text-[8px] text-muted-foreground shrink-0">
                +{item.partOfSpeech.length - 2}
              </span>
            )}
          </div>
        ) : null;
      case "wordTypes":
        return wordTypes.length ? (
          <div key={field} className="flex items-center gap-0.5">
            {wordTypes.slice(0, 4).map((wt) => (
              <span
                key={wt.id}
                title={wt.name}
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: wt.color }}
              />
            ))}
          </div>
        ) : null;
      case "topic":
        return topic ? (
          <span
            key={field}
            className={cn(
              "text-[8px] font-medium px-1 rounded truncate max-w-full",
              getColorStyle(topic.color).badge,
            )}
          >
            {topic.label}
          </span>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <>
      {isEditOpen && (
        <EditVocabularyModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          word={item}
          onSave={onUpdate}
          onDelete={onDelete}
        />
      )}

      <Tooltip delayDuration={150} onOpenChange={onDetailOpenChange}>
        <VocabularyDetailPopup
          item={item}
          topic={topic}
          side="top"
          align="center"
          onOpenChange={onDetailOpenChange}
          trigger={
            <TooltipTrigger asChild>
              <div
                aria-label={t("review.viewDetail")}
                style={{ height: CARD_HEIGHT }}
                className="group relative shrink-0 w-[104px] md:w-[116px] rounded-lg border overflow-hidden cursor-pointer transition-colors hover:border-foreground/70 dark:hover:border-foreground/60"
              >
                {showImage ? (
                  <>
                    {/* --- CÓ ẢNH: ảnh trên, chữ dưới --- */}
                    <div className="relative h-[46px] md:h-[52px] w-full bg-muted overflow-hidden shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.text}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.visibility = "hidden";
                        }}
                      />
                    </div>
                    <div
                      className="px-1.5 py-1 flex flex-col items-center justify-center gap-0.5 bg-card overflow-hidden"
                      style={{ height: CARD_HEIGHT - 46 }}
                    >
                      <div className="text-xs font-semibold text-foreground truncate w-full text-center">
                        {item.text}
                      </div>
                      {style.detailFields.map(renderDetailField)}
                    </div>
                  </>
                ) : (
                  // --- KHÔNG ẢNH (hoặc tắt hiển thị ảnh): nền pastel nhạt, chữ đậm màu nổi bật ---
                  <div
                    className={cn(
                      "relative h-full w-full flex flex-col items-center justify-center gap-0.5 px-1.5 py-2 overflow-hidden",
                      palette.badge,
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none absolute -bottom-3 -right-1 text-6xl font-black opacity-10 select-none leading-none",
                        palette.text,
                      )}
                    >
                      {item.text?.[0]?.toUpperCase()}
                    </span>
                    <div
                      className={cn(
                        "relative text-sm font-bold truncate w-full text-center",
                        palette.text,
                      )}
                    >
                      {item.text}
                    </div>
                    {style.detailFields.map(renderDetailField)}
                  </div>
                )}

                {/* Đã thuộc - luôn hiện, đặt giữa trên để tránh đè 2 góc trên */}
                {item.isLearned && (
                  <span
                    className="absolute top-1 left-1/2 -translate-x-1/2 rounded-full bg-green-500/90 text-white p-0.5 z-10"
                    title={t("review.learned")}
                  >
                    <Check size={9} />
                  </span>
                )}

                {/* Sửa từ - góc trên trái, hiện khi hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    stop(e);
                    setIsEditOpen(true);
                  }}
                  title={t("card.editWord")}
                  className={cn(
                    iconBtnClass,
                    "absolute top-1 left-1 opacity-0 group-hover:opacity-100 z-10",
                  )}
                >
                  <PenLine size={11} />
                </button>

                {/* Phát âm - góc trên phải, hiện khi hover */}
                <button
                  type="button"
                  onClick={handleSpeak}
                  title={t("card.playAudio")}
                  className={cn(
                    iconBtnClass,
                    "absolute top-1 right-1 opacity-0 group-hover:opacity-100 z-10",
                  )}
                >
                  <Volume2 size={11} />
                </button>

                {/* Thêm vào phiên hiện tại - góc dưới trái, hiện khi hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    stop(e);
                    onAddToSession(item);
                  }}
                  title={t("review.addToSession")}
                  className={cn(
                    iconBtnClass,
                    "absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 z-10",
                  )}
                >
                  <ListPlus size={11} />
                </button>

                {/* Mở trong danh sách từ vựng - góc dưới phải, hiện khi hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    stop(e);
                    onOpenInVocabulary(item);
                  }}
                  title={t("review.openInVocabulary")}
                  className={cn(
                    iconBtnClass,
                    "absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 z-10",
                  )}
                >
                  <SquareArrowOutUpRight size={11} />
                </button>
              </div>
            </TooltipTrigger>
          }
        />

        {/* Tooltip nghĩa + ví dụ - trồi lên phía trên, không đè lên card */}
        <TooltipContent
          side="top"
          align="center"
          className="max-w-[220px] bg-popover text-popover-foreground border shadow-lg px-3 py-2"
        >
          <div className="text-xs font-medium leading-snug">{item.meaning}</div>
          {item.example && (
            <div className="text-[10px] italic leading-snug text-muted-foreground mt-1 line-clamp-3">
              {item.example}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </>
  );
};
