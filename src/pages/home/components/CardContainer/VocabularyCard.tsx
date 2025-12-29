import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TOPIC_COLORS } from "@/constants";
import { TopicItem, VocabularyItem } from "@/types";
import {
  Check,
  Eye, // Dùng icon Eye làm biểu tượng "Xem chi tiết" hoặc "Hover to show"
  FolderSearch,
  Info, // Icon mới cho nút xem chi tiết (nếu muốn đổi)
  PenLine,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { EditPopoverContent } from "../common/EditPopoverContent";
import { FlashcardCommand } from "./FlashcardSection";
import { DisplayText } from "@/components/DisplayText";
import { VocabularyDetailContent } from "../common/VocabularyDetailContent";

interface VocabularyCardProps {
  item: VocabularyItem;
  command: FlashcardCommand | null;
  isFlipped: boolean;
  showMeaning: boolean;
  topics: TopicItem[];
  onLearned: (id: string, isLearned: boolean) => Promise<void> | void;
  remove: (id: string) => void;
  onFlip: (isFlipped: boolean) => void;
  onToggleMeaning: (showMeaning: boolean) => void;
  onUpdate: (id: string, updates: Partial<VocabularyItem>) => void;
  onDelete: (id: string) => void;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  item,
  topics,
  isFlipped,
  showMeaning,
  onLearned,
  remove,
  onFlip,
  onToggleMeaning,
  onUpdate,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  // State mới cho Popover chi tiết (nếu cần control open state, ở đây để tự động)
  
  const currentTopic = useMemo(() => {
    if (!item.topicId) return null;
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

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
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

  const renderTopic = () => {
    return (
      <>
        {currentTopic && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <FolderSearch
                  className={`w-4 absolute top-[2px] -translate-x-1/2 left-1/2 ${topicColorStyle.text}`}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Topic: {currentTopic.label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </>
    );
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer perspective-1000 group w-full sm:w-40 h-50 transition-all duration-300 hover:translate-y-1"
    >
      <Card
        className={`
        relative w-full h-full flex flex-col items-center justify-center p-2 text-center shadow-lg border-2 overflow-hidden
        transition-all duration-500 ease-in-out
        ${
          isFlipped
            ? "bg-card border-blue-200 dark:border-blue-800"
            : "bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950 border-purple-500/50 dark:border-purple-400/30 shadow-2xl shadow-purple-500/20 dark:shadow-purple-400/10"
        }
      `}
      >
        {/* --- BACK SIDE (ÚP) --- */}
        {!isFlipped && (
          <div className="flex flex-col items-center justify-center relative w-full h-full animate-in fade-in zoom-in-95 duration-500">
            {/* ... Giữ nguyên phần UI Back Side ... */}
            <div className="absolute inset-0 opacity-15 dark:opacity-25">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:16px_16px]"></div>
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(168,85,247,0.15)_60deg,transparent_120deg,rgba(99,102,241,0.15)_180deg,transparent_240deg,rgba(59,130,246,0.15)_300deg,transparent_360deg)]"></div>
              <div className="absolute inset-0 bg-[repeating-linear-gradient(30deg,transparent,transparent_10px,rgba(168,85,247,0.1)_10px,rgba(168,85,247,0.1)_11px)]"></div>
            </div>

            <div className="absolute top-2 left-2 w-8 h-8 border-2 border-purple-400/30 rotate-45"></div>
            <div className="absolute top-4 right-3 w-6 h-6 border-2 border-indigo-400/30 rounded-full"></div>
            <div className="absolute bottom-3 left-4 w-5 h-5 border-2 border-blue-400/30 rotate-45"></div>
            <div className="absolute bottom-2 right-2 w-7 h-7 border-2 border-purple-400/30 rounded-full"></div>

            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-purple-400/40"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-indigo-400/40"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-blue-400/40"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-purple-400/40"></div>

            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-indigo-500/15 to-blue-500/15 dark:from-purple-400/25 dark:via-indigo-400/25 dark:to-blue-400/25 blur-xl"></div>

            <div
              className="absolute top-0 left-0 p-1.5 rounded-full hover:bg-white/20 dark:hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100 text-white/70 hover:text-red-300 dark:hover:text-red-400 z-20 backdrop-blur-sm"
              onClick={handleRemove}
              title="Remove"
            >
              <X size={16} />
            </div>

            <div className="relative z-10 flex items-center justify-center">
              <div className="text-white/95 dark:text-white font-bold text-6xl select-none drop-shadow-[0_0_12px_rgba(168,85,247,0.7)] dark:drop-shadow-[0_0_15px_rgba(196,181,253,0.8)]">
                ?
              </div>
              <div className="absolute inset-0 text-white/30 dark:text-purple-300/30 font-bold text-6xl select-none blur-lg">
                ?
              </div>
            </div>

            <p className="text-white/85 dark:text-purple-200 text-[10px] mt-5 uppercase tracking-[0.2em] font-semibold z-10 drop-shadow-lg">
              Tap to reveal
            </p>

            <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-white/70 rounded-full"></div>
            <div className="absolute bottom-4 left-3 w-1 h-1 bg-purple-300/70 rounded-full"></div>
            <div className="absolute top-1/2 right-4 w-1 h-1 bg-blue-300/70 rounded-full"></div>
            <div className="absolute top-1/3 left-2 w-1.5 h-1.5 bg-indigo-300/70 rounded-full"></div>
            <div className="absolute bottom-1/3 right-2 w-1 h-1 bg-purple-200/70 rounded-full"></div>
          </div>
        )}

        {/* --- FRONT SIDE (NGỬA) --- */}
        {isFlipped && (
          <div className="flex flex-col h-full w-full relative animate-in fade-in zoom-in-95 duration-500">
            <div className="absolute -top-1 left-0 w-full flex items-center gap-1 z-30">
              <div
                className="p-1.5 mr-auto rounded-full hover:bg-accent text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                onClick={handleRemove}
                title="Remove"
              >
                <X size={14} />
              </div>

              {renderTopic()}

              <Popover open={isEditOpen} onOpenChange={setIsEditOpen}>
                <PopoverTrigger asChild>
                  <div
                    className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                    title="Edit word"
                  >
                    <PenLine size={14} />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-max p-4"
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EditPopoverContent
                    word={item}
                    onSave={onUpdate}
                    onDelete={(id) => {
                      onDelete(id);
                      remove(id);
                    }}
                    onClose={() => setIsEditOpen(false)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-3 py-8 min-h-0 overflow-hidden">
              {/* --- TEXT SECTION --- */}
              <div className="h-[55px] min-h-[55px] mb-2 flex flex-col justify-end">
                {item.example ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <div
                        className="text-lg font-bold text-foreground cursor-help decoration-dashed underline decoration-border underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center"
                        onClick={(e) => e.stopPropagation()}
                        title="Click to see note"
                      >
                        {item.text}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-64 p-3 bg-popover/95 backdrop-blur shadow-xl text-sm"
                      side="top"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="font-semibold text-popover-foreground border-b border-border pb-1">
                        Note:
                      </div>
                      <p className="text-popover-foreground/80 italic leading-relaxed">
                        <DisplayText text={item.example}/>
                      </p>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div
                    className="text-lg font-bold text-foreground line-clamp-2 text-center"
                    title={item.text}
                  >
                    {item.text}
                  </div>
                )}
              </div>

              <div className="w-12 !m-0 h-[2px] min-h-[2px] bg-border rounded-full my-2"></div>

              {/* --- MEANING SECTION (MODIFIED) --- */}
              <div
                className="relative group/meaning h-[40px] min-h-[40px] mt-2 w-full flex flex-col items-center justify-center cursor-pointer"
                onClick={(e) => {
                  if (!item.meaning) return;
                  e.stopPropagation();
                  onToggleMeaning(!showMeaning);
                }}
              >
                {/* Lớp nội dung (Text) */}
                <p
                  className={`
                    text-[12px] font-medium text-muted-foreground italic break-words leading-relaxed text-center line-clamp-3 transition-all duration-300
                    ${
                      showMeaning
                        ? "opacity-100 blur-0"
                        : "opacity-30 blur-md select-none grayscale"
                    }
                  `}
                >
                  {item.meaning}
                </p>

                {/* Lớp Overlay chỉ hiện khi hover và đang bị ẩn (showMeaning = false) */}
                {!showMeaning && item.meaning && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/meaning:opacity-100 transition-opacity duration-200 z-10">
                     {/* Icon báo hiệu có thể click để xem */}
                     <Eye size={18} className="text-primary/70 bg-background/80 rounded-full p-0.5 shadow-sm" />
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full flex items-center justify-between gap-2 z-20">
              <div
                className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
                onClick={handleSpeak}
                title="Pronounce"
              >
                <Volume2 size={14} />
              </div>

              {/* --- NÚT CON MẮT CŨ -> GIỜ LÀ NÚT XEM FULL DETAIL --- */}
              <Popover>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <div
                          className="p-1.5 rounded-full hover:bg-accent text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                          onClick={(e) => e.stopPropagation()} // Chỉ mở popover, không flip card
                        >
                          {/* Dùng icon Info hoặc Eye tùy sở thích để biểu thị "Xem chi tiết" */}
                          <Info size={14} />
                        </div>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">View details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <PopoverContent 
                    side="top" 
                    className="w-80 p-4"
                    onClick={(e) => e.stopPropagation()}
                >
                   <VocabularyDetailContent item={item} topic={currentTopic || undefined} />
                </PopoverContent>
              </Popover>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        !item.isLearned
                          ? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900"
                          : "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900"
                      }`}
                      onClick={handleMarkAsLearned}
                    >
                      {loading ? (
                        <span className="animate-spin text-xs">⏳</span>
                      ) : item.isLearned ? (
                        <RotateCcw size={14} />
                      ) : (
                        <Check size={14} />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {item.isLearned ? "Mark as unlearned" : "Mark as learned"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VocabularyCard;