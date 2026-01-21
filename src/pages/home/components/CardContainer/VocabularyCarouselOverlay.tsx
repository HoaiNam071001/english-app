import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TOPIC_COLORS } from "@/constants";
import { TopicItem, VocabularyItem } from "@/types";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { EditVocabularyModal } from "../common/EditVocabularyModal";
import { CardFront } from "./VocabularyCard/CardFront";

interface VocabularyCarouselOverlayProps {
  items: VocabularyItem[]; // Danh sách toàn bộ card
  defaultActiveId: string; // ID card được chọn ban đầu
  topics: TopicItem[];
  isOpen: boolean;
  onClose: () => void;
  // Các handler cần thiết truyền xuống
  showMeaning: boolean;
  hideImage: boolean;
  onUpdate: (id: string, updates: Partial<VocabularyItem>) => void;
  onDelete: (id: string) => void;
  onLearned: (id: string, isLearned: boolean) => Promise<void> | void;
  onToggleMeaning: (show: boolean) => void;
  onToggleImage: (show: boolean) => void;
  setZoomedId: (id: string) => void;
}

export const VocabularyCarouselOverlay: React.FC<
  VocabularyCarouselOverlayProps
> = ({
  items,
  defaultActiveId,
  topics,
  isOpen,
  onClose,
  showMeaning,
  hideImage,
  onUpdate,
  onDelete,
  onLearned,
  onToggleMeaning,
  onToggleImage,
  setZoomedId,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transitionState, setTransitionState] = useState<"idle" | "fading">(
    "idle",
  );

  useEffect(() => {
    if (isOpen && defaultActiveId) {
      const idx = items.findIndex((i) => i.id === defaultActiveId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [isOpen, defaultActiveId, items]);

  const currentItem = items[currentIndex];

  const currentTopic = useMemo(() => {
    if (!currentItem?.topicId) return undefined;
    return topics.find((t) => t.id === currentItem.topicId);
  }, [currentItem, topics]);

  const topicColorStyle = useMemo(() => {
    if (!currentTopic?.color) return { text: "bg-muted" };
    return (
      TOPIC_COLORS.find((c) => c.id === currentTopic.color) || {
        text: "bg-muted",
      }
    );
  }, [currentTopic]);

  const handleNext = () => {
    setTransitionState("fading");
    setTimeout(() => {
      const index = (currentIndex + 1) % items.length;
      setZoomedId(items[index].id);
      setCurrentIndex(currentIndex);
      setTransitionState("idle");
    }, 200);
  };

  const handlePrev = () => {
    setTransitionState("fading");
    setTimeout(() => {
      const index = (currentIndex - 1 + items.length) % items.length;
      setZoomedId(items[index].id);
      setCurrentIndex(index);
      setTransitionState("idle");
    }, 200);
  };

  const handleMarkAsLearned = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentItem) return;
    setLoading(true);
    try {
      // Toggle trạng thái local tạm thời hoặc đợi update từ parent
      await onLearned(currentItem.id, !currentItem.isLearned);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !currentItem) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      {/* 1. Background mờ (Deep Overlay) */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />

      {/* 2. Edit Modal (Layer trên cùng nếu có) */}
      {isEditOpen && (
        <EditVocabularyModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          word={currentItem}
          onSave={onUpdate}
          onDelete={(id) => {
            onDelete(id);
            onClose();
          }}
        />
      )}

      {/* 3. Container chính điều hướng */}
      <div className="relative z-10 w-full max-w-5xl h-[85vh] flex items-center justify-between gap-6 animate-modalIn">
        {/* Nút Trái (Desktop) - Kiểu kính mờ */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          className="hidden md:flex rounded-full bg-white/5 text-white hover:bg-white/20 hover:scale-110 transition-all border border-white/10 w-12 h-12 shadow-xl backdrop-blur-md"
        >
          <ChevronLeft size={32} />
        </Button>

        {/* 4. Card To - Trung tâm lấp lánh */}
        <div className="flex-1 h-full flex items-center justify-center relative">
          {/* Hiệu ứng hào quang (Glow) phía sau card */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-[120px] rounded-full" />

          <div
            className={`
          relative w-full max-w-sm h-[60vh] md:h-[60vh] 
          transition-all duration-500 ease-out transform
          /* Tạo viền Gradient */
          p-[2px] rounded-[24px] bg-gradient-to-br from-purple-500 via-fuchsia-400 to-cyan-400
          shadow-[0_0_50px_-12px_rgba(168,85,247,0.5)]
          ${
            transitionState === "fading"
              ? "opacity-0 scale-95 -translate-x-8 blur-sm"
              : "opacity-100 scale-100 translate-x-0 blur-0"
          }
        `}
          >
            {/* Card nội dung bên trong viền Gradient */}
            <Card className="w-full h-full border-none shadow-none overflow-hidden bg-slate-200 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[22px]">
              <CardFront
                item={currentItem}
                currentTopic={currentTopic}
                topicColorStyle={topicColorStyle}
                isZoomMode={true}
                showMeaning={showMeaning}
                hideImage={hideImage}
                loading={loading}
                isExpanded={true}
                onRemove={(e) => e.stopPropagation()}
                onToggleMeaning={onToggleMeaning}
                onToggleImage={onToggleImage}
                onUpdate={onUpdate}
                onMarkLearned={handleMarkAsLearned}
                onEditOpen={() => setIsEditOpen(true)}
                onToggleExpand={onClose}
              />
            </Card>
          </div>
        </div>

        {/* Nút Phải (Desktop) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="hidden md:flex rounded-full bg-white/5 text-white hover:bg-white/20 hover:scale-110 transition-all border border-white/10 w-12 h-12 shadow-xl backdrop-blur-md"
        >
          <ChevronRight size={32} />
        </Button>
      </div>

      {/* 5. Nút đóng góc phải trên */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[110]"
        onClick={onClose}
      >
        <X size={24} />
      </Button>

      {/* 6. Mobile Navigation (Hiện đại hơn) */}
      <div className="absolute bottom-16 flex gap-12 md:hidden z-50">
        <Button
          size="icon"
          className="rounded-full bg-white/10 backdrop-blur-xl text-white border border-white/20 w-14 h-14 shadow-2xl active:scale-90 transition-transform"
          onClick={handlePrev}
        >
          <ChevronLeft size={28} />
        </Button>
        <Button
          size="icon"
          className="rounded-full bg-white/10 backdrop-blur-xl text-white border border-white/20 w-14 h-14 shadow-2xl active:scale-90 transition-transform"
          onClick={handleNext}
        >
          <ChevronRight size={28} />
        </Button>
      </div>
    </div>
  );
};
