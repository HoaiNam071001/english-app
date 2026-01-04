import { DisplayText } from "@/components/DisplayText";
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
import { AccentType, TopicItem, VocabularyItem } from "@/types";
import { getIconComponent } from "@/utils";
import { playAudio } from "@/utils/audio";
import {
  Check,
  Eye,
  Info,
  PenLine,
  Pin, // [NEW] Import PinOff
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { EditVocabularyModal } from "../common/EditVocabularyModal";
import { PartSpeech } from "../common/PartSpeech";
import { Phonetics } from "../common/Phonetic";
import { VocabularyDetailContent } from "../common/VocabularyDetailContent";
import { FlashcardCommand } from "./FlashcardSection";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

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
    const TopicIcon = currentTopic
      ? getIconComponent(currentTopic.icon || "folder")
      : null;

    return (
      <>
        {currentTopic && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <TopicIcon
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

      <div
        onClick={handleCardClick}
        className="relative cursor-pointer perspective-1000 group w-full sm:w-40 h-50 transition-all duration-300 hover:scale-[102%]"
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
              {/* [NEW] 1. PIN INDICATOR: Absolute Top Right */}

              <div className="absolute -top-1 left-0 w-full flex items-center gap-1 z-30">
                <div
                  className="p-1.5 mr-auto rounded-full hover:bg-accent text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  onClick={handleRemove}
                  title="Remove"
                >
                  <X size={14} />
                </div>

                {renderTopic()}

                {/* Edit Button */}
                <div
                  className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditOpen(true);
                  }}
                  title="Edit word"
                >
                  <PenLine size={14} />
                </div>
              </div>

              {/* MAIN CONTENT */}
              <div className="flex-1 flex flex-col items-center justify-center py-8 min-h-0 overflow-hidden">
                <div className="h-[60px] min-h-[60px] flex flex-col justify-end">
                  <div className="relative flex items-center flex-col">
                    <PartSpeech data={item.partOfSpeech} />
                    <Phonetics item={item} />
                  </div>
                  {item.example ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <div
                          className="text-lg font-bold text-foreground cursor-help decoration-dashed underline decoration-border underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.text}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-100 p-3 bg-popover/95 backdrop-blur shadow-xl text-sm"
                        side="top"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="font-semibold text-popover-foreground border-b border-border pb-1">
                          Note:
                        </div>
                        <div className="text-popover-foreground/80 italic leading-relaxed max-h-[300px] overflow-auto">
                          <DisplayText text={item.example} />
                        </div>
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

                <div className="w-12 !m-0 h-[2px] min-h-[2px] bg-border rounded-full"></div>

                <div
                  className="relative group/meaning h-[40px] min-h-[40px] mt-1 w-full flex flex-col items-center justify-start cursor-pointer"
                  onClick={(e) => {
                    if (!item.meaning) return;
                    e.stopPropagation();
                    onToggleMeaning(!showMeaning);
                  }}
                >
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

                  {!showMeaning && item.meaning && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/meaning:opacity-100 transition-opacity duration-200 z-10">
                      <Eye
                        size={18}
                        className="text-primary/70 bg-background/80 rounded-full p-0.5 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* [UPDATED] 3. BOTTOM ACTIONS: UI "Dock" Style */}
              <div className="absolute bottom-0 left-0 w-full z-20">
                <div className="flex items-center gap-2 justify-between bg-secondary/50 backdrop-blur-sm rounded-full p-0.5 border border-border/50 shadow-sm">
                  <Speaker item={item} />

                  <div
                    className={`p-1.5 rounded-full transition-all cursor-pointer hover:bg-background `}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(item.id, { isPinned: !item.isPinned });
                    }}
                    title={item.isPinned ? "Unpin" : "Pin item"}
                  >
                    <Pin size={15} />
                  </div>

                  <div
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      !item.isLearned
                        ? " text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900"
                        : " text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900"
                    }`}
                    onClick={handleMarkAsLearned}
                    title={
                      item.isLearned ? "Mark as unlearned" : "Mark as learned"
                    }
                  >
                    {loading ? (
                      <span className="animate-spin text-xs">⏳</span>
                    ) : item.isLearned ? (
                      <RotateCcw size={14} />
                    ) : (
                      <Check size={14} />
                    )}
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <div
                        className="p-1.5 rounded-full hover:bg-background hover:text-blue-500 transition-all cursor-pointer text-muted-foreground"
                        onClick={(e) => e.stopPropagation()}
                        title="View details"
                      >
                        <Info size={15} />
                      </div>
                    </PopoverTrigger>

                    <PopoverContent
                      side="right"
                      className="w-max p-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <VocabularyDetailContent
                        item={item}
                        topic={currentTopic || undefined}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default VocabularyCard;

const Speaker = ({ item }: { item: VocabularyItem }) => {
  const audioSourceType = useMemo(() => {
    const usAudio = item.phonetics?.find(
      (p) => p.audio && p.accent === AccentType.US
    );
    if (usAudio?.audio) return AccentType.US;
    const otherAudio = item.phonetics?.find((p) => p.audio);
    if (otherAudio?.audio) return "other";
    return "tts";
  }, [item.phonetics]);

  const speakerStyle = useMemo(() => {
    switch (audioSourceType) {
      case AccentType.US:
        return "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800";
      case "other":
        return "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:hover:bg-cyan-800";
      case "tts":
      default:
        return "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:hover:bg-orange-800";
    }
  }, [audioSourceType]);
  const speakerTooltip = useMemo(() => {
    if (audioSourceType === "us") return "Play US Audio";
    if (audioSourceType === "other") return "Play Audio";
    return "Browser Text-to-Speech";
  }, [audioSourceType]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const usAudio = item.phonetics?.find(
      (p) => p.audio && p.accent === AccentType.US
    );
    const otherAudio = item.phonetics?.find((p) => p.audio);
    playAudio(
      usAudio?.audio || otherAudio?.audio,
      item.text,
      usAudio?.accent || otherAudio?.accent
    );
  };
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${speakerStyle}`}
              onClick={handleSpeak}
            >
              <Volume2 size={14} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">{speakerTooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
