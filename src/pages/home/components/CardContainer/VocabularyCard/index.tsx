import { Card } from "@/components/ui/card";
import { TOPIC_COLORS } from "@/constants";
import { useInViewport } from "@/hooks/useInViewport";
import { TopicItem, VocabularyItem } from "@/types";
import { Pin } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditVocabularyModal } from "../../common/EditVocabularyModal";
import { FlashcardCommand } from "../FlashcardSection";
import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";

// --- TYPES ---
// Giữ nguyên các props cũ, thêm onEnterZoomMode để trigger mở card to
export interface VocabularyCardProps {
  item: VocabularyItem;
  command: FlashcardCommand | null;
  isFlipped: boolean;
  showMeaning: boolean;
  hideImage: boolean;
  topics: TopicItem[];
  onLearned: (id: string, isLearned: boolean) => Promise<void> | void;
  remove: (id: string) => void;
  onFlip: (isFlipped: boolean) => void;
  onToggleMeaning: (showMeaning: boolean) => void;
  onToggleImage: (hideImage: boolean) => void;
  onUpdate: (id: string, updates: Partial<VocabularyItem>) => void;
  onDelete: (id: string) => void;
  onEnterZoomMode?: (id: string) => void;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  item,
  topics,
  isFlipped,
  showMeaning,
  hideImage = false,
  onLearned,
  remove,
  onFlip,
  onToggleMeaning,
  onToggleImage,
  onUpdate,
  onDelete,
  onEnterZoomMode,
}) => {
  const { t } = useTranslation("home");
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Chỉ render nội dung nặng (ảnh, popover...) khi card ở gần/trong vùng nhìn thấy,
  // giúp scroll mượt hơn khi danh sách có nhiều card.
  const { ref: cardWrapperRef, isVisible } = useInViewport<HTMLDivElement>();

  // Tính toán màu sắc topic
  const currentTopic = useMemo(() => {
    if (!item.topicId) return undefined;
    return topics.find((t) => t.id === item.topicId);
  }, [item.topicId, topics]);

  const topicColorStyle = useMemo(() => {
    if (!currentTopic?.color) return { text: "bg-muted" };
    return (
      TOPIC_COLORS.find((c) => c.id === currentTopic.color) || {
        text: "bg-muted",
      }
    );
  }, [currentTopic]);

  const handleCardClick = () => {
    if (isEditOpen) return;
    onFlip(!isFlipped);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    remove(item.id);
  };

  const handleMarkAsLearned = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      item.isLearned = !item.isLearned;
      await onLearned(item.id, item.isLearned);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Khi bấm nút expand ở card nhỏ -> gọi prop ra ngoài
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEnterZoomMode) {
      onEnterZoomMode(item.id);
    }
  };

  return (
    <>
      {/* COMPONENT EDIT MODAL */}
      {isEditOpen && (
        <EditVocabularyModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          word={item}
          onSave={onUpdate}
          onDelete={(id) => {
            onDelete(id);
            remove(id);
          }}
        />
      )}

      {/* THẺ BÌNH THƯỜNG TRONG LIST */}
      <div
        ref={cardWrapperRef}
        className="relative w-38 md:w-40 h-50 group perspective-1000"
      >
        {isVisible ? (
          <>
            {/* Pin Icon */}
            {isFlipped && item.isPinned && (
              <div
                className="absolute -top-1 -right-1 z-40 transition-all duration-300 pointer-events-none"
                title={t("card.pinned")}
              >
                <Pin
                  size={16}
                  className="text-orange-500 fill-orange-500 rotate-45 drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]"
                />
              </div>
            )}

            <Card
              onClick={handleCardClick}
              className={`
                relative w-full h-full flex flex-col items-center justify-center pt-2 pb-0.5 px-0.5 text-center shadow-lg border-2 overflow-hidden cursor-pointer
                transition-all duration-500 ease-in-out
                ${
                  isFlipped
                    ? "flashcard-face-surface border-primary/35 hover:border-primary/70 dark:border-primary/45 dark:hover:border-primary/80"
                    : "flashcard-back-surface border-primary/30 dark:border-primary/40 shadow-xl shadow-primary/25 dark:shadow-black/45"
                }
              `}
            >
              {/* --- BACK SIDE (ÚP) --- */}
              {!isFlipped && <CardBack handleRemove={handleRemove} />}

              {/* --- FRONT SIDE (NGỬA) --- */}
              {isFlipped && (
                <CardFront
                  item={item}
                  currentTopic={currentTopic}
                  topicColorStyle={topicColorStyle}
                  isZoomMode={false} // Card nhỏ
                  showMeaning={showMeaning}
                  hideImage={hideImage}
                  loading={loading}
                  isExpanded={false}
                  onRemove={handleRemove}
                  onToggleMeaning={() => onToggleMeaning(!showMeaning)}
                  onToggleImage={() => onToggleImage(!hideImage)}
                  onUpdate={onUpdate}
                  onMarkLearned={handleMarkAsLearned}
                  onEditOpen={() => setIsEditOpen(true)}
                  onToggleExpand={handleToggleExpand} // Trigger ra ngoài
                />
              )}
            </Card>
          </>
        ) : (
          // Placeholder giữ đúng kích thước để layout/scrollbar không bị nhảy
          <div className="w-full h-full rounded-xl border-2 border-transparent bg-muted/40 animate-pulse" />
        )}
      </div>
    </>
  );
};

export default VocabularyCard;
