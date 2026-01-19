import { Card } from "@/components/ui/card";
import { TOPIC_COLORS } from "@/constants";
import { TopicItem, VocabularyItem } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Pin } from "lucide-react";
import React, { useMemo, useState } from "react";
import { EditVocabularyModal } from "../../common/EditVocabularyModal";
import { FlashcardCommand } from "../FlashcardSection";
import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";

// --- TYPES ---
interface VocabularyCardProps {
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
}) => {
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
    if (isEditOpen || isExpanded) return;
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

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* 1. COMPONENT EDIT MODAL RIÊNG BIỆT */}
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

      {/* ✨ 2. PHẦN HIỂN THỊ ZOOM (LỚP PHỦ) */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[10] flex items-center justify-center p-4">
            {/* Background mờ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsExpanded(false)}
            />

            {/* Thẻ to */}
            <motion.div
              layoutId={`card-${item.id}`}
              className="relative w-full max-w-lg h-[70vh] bg-card rounded-xl shadow-2xl overflow-hidden border-2 border-purple-500 z-1"
            >
              <Card className="w-full h-full border-none shadow-none">
                <CardFront
                  item={item}
                  currentTopic={currentTopic}
                  topicColorStyle={topicColorStyle}
                  isZoomMode={true}
                  showMeaning={showMeaning}
                  hideImage={hideImage}
                  loading={loading}
                  isExpanded={isExpanded}
                  onRemove={handleRemove}
                  onToggleMeaning={() => onToggleMeaning(!showMeaning)}
                  onToggleImage={() => onToggleImage(!hideImage)}
                  onUpdate={onUpdate}
                  onMarkLearned={handleMarkAsLearned}
                  onEditOpen={() => setIsEditOpen(true)}
                  onToggleExpand={handleToggleExpand}
                />
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ✨ 3. THẺ BÌNH THƯỜNG TRONG LIST */}
      <div className="relative w-38 md:w-40 h-50">
        {/* Placeholder: giữ chỗ trong danh sách khi thẻ thật bay ra ngoài zoom */}
        {isExpanded && <div className="w-full h-full opacity-0" />}

        {/* Thẻ chính */}
        {!isExpanded && (
          <motion.div
            layoutId={`card-${item.id}`}
            onClick={handleCardClick}
            className="cursor-pointer perspective-1000 group w-full h-full transition-all duration-300 absolute inset-0"
          >
            {isFlipped && item.isPinned && (
              <div
                className="absolute -top-1 -right-1 z-40 animate-in fade-in zoom-in duration-300 pointer-events-none"
                title="Pinned"
              >
                <Pin
                  size={16}
                  className="text-orange-500 fill-orange-500 rotate-[45deg] drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]"
                />
              </div>
            )}

            <Card
              className={`
                relative w-full h-full flex flex-col items-center justify-center pt-2 pb-[2px] px-[2px] text-center shadow-lg border-2 overflow-hidden
                transition-all duration-500 ease-in-out
                ${
                  isFlipped
                    ? "bg-card border-blue-200 dark:border-blue-800 hover:border-blue-400 hover:dark:border-blue-500"
                    : "bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950 border-purple-500/50 dark:border-purple-400/30 shadow-2xl shadow-purple-500/20 dark:shadow-purple-400/10"
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
                  isZoomMode={false}
                  showMeaning={showMeaning}
                  hideImage={hideImage}
                  loading={loading}
                  isExpanded={isExpanded}
                  onRemove={handleRemove}
                  onToggleMeaning={() => onToggleMeaning(!showMeaning)}
                  onToggleImage={() => onToggleImage(!hideImage)}
                  onUpdate={onUpdate}
                  onMarkLearned={handleMarkAsLearned}
                  onEditOpen={() => setIsEditOpen(true)}
                  onToggleExpand={handleToggleExpand}
                />
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default VocabularyCard;
