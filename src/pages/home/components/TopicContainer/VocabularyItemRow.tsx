import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VocabularyItem } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TOPIC_COLORS } from "@/constants";
import { useTopics } from "@/hooks/useTopics";
import {
  Check,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Globe,
  Info,
  Minus,
  PenLine,
  Pin,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EditVocabularyModal } from "../common/EditVocabularyModal";
import { Phonetics } from "../common/Phonetic";
import { VocabularyDetailContent } from "../common/VocabularyDetailContent";
import { WordTypeIndicator } from "../common/WordTypeIndicator";

interface VocabularyItemRowProps {
  word: VocabularyItem;
  isActive: boolean;
  isSelected: boolean;
  isMeaningRevealed: boolean;
  onToggleSelection: (id: string, e?: React.MouseEvent) => void;
  onToggleReveal: (id: string) => void;
  onAddToPractice: (word: VocabularyItem) => void;
  onRemoveFromPractice: (word: VocabularyItem) => void;
  onUpdate: (id: string, updates: Partial<VocabularyItem>) => void;
  onDelete: (id: string) => void;
  onToggleLearned: (id: string, currentStatus: boolean) => void;
}

export const VocabularyItemRow: React.FC<VocabularyItemRowProps> = ({
  word,
  isActive,
  isSelected,
  isMeaningRevealed,
  onToggleSelection,
  onToggleReveal,
  onAddToPractice,
  onUpdate,
  onDelete,
  onToggleLearned,
  onRemoveFromPractice,
}) => {
  const { topics } = useTopics();
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Tìm Topic hiện tại của từ
  const currentTopic = useMemo(() => {
    if (!word.topicId) return null;
    return topics.find((t) => t.id === word.topicId);
  }, [word.topicId, topics]);

  // Lấy style màu Topic
  const topicColorStyle = useMemo(() => {
    if (!currentTopic?.color) return { bg: "bg-muted" };
    return (
      TOPIC_COLORS.find((c) => c.id === currentTopic.color) || {
        bg: "bg-muted",
      }
    );
  }, [currentTopic]);

  return (
    <>
      <div
        className={`
        max-w-full relative select-none group/actions p-2 text-sm border rounded-lg transition-all flex items-start gap-3 group
        ${
          isSelected
            ? "bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
            : "border-border hover:border-border/80"
        }
        ${
          isActive
            ? "border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-muted/50"
            : ""
        }
      `}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelection(word.id, e);
        }}
      >
        {/* --- LEFT COLUMN: Checkbox & WordType Indicators --- */}
        <div className="pt-1 cursor-pointer flex flex-col items-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => {}}
            className="pointer-events-none mb-2"
          />

          <WordTypeIndicator typeIds={word.typeIds} />
        </div>

        {/* --- MIDDLE COLUMN: Content --- */}
        <div className="flex-1 min-w-0 pb-1 cursor-default flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            {word.isLearned ? (
              <CheckCircle2 size={14} className="text-green-500 shrink-0" />
            ) : (
              <Circle size={14} className="text-muted-foreground shrink-0" />
            )}

            {currentTopic && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${topicColorStyle.bg} cursor-help`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Topic: {currentTopic.label}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <span
              className={`font-medium truncate max-w-[200px] ${
                word.isLearned && !isActive
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {word.text}
            </span>
            <Phonetics item={word} className="truncate" />
          </div>

          <div className="relative w-fit h-[16px]">
            <div
              className={`text-xs text-muted-foreground truncate duration-100 max-w-[200px] cursor-default
              ${
                !isMeaningRevealed
                  ? "blur-[4px] select-none opacity-60"
                  : "blur-0 opacity-100"
              }
            `}
            >
              {word.meaning}
            </div>
          </div>
        </div>

        {/* --- TOP RIGHT ZONE (Shared, Details, Pin) --- */}
        <div className="absolute top-1 right-1 flex items-center gap-1">
          {/* [NEW] Moved isShared Icon here */}
          {word.isShared && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center w-6 h-6">
                    <Globe size={13} className="text-muted-foreground/70" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Public: Shared with community
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Popover>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full text-muted-foreground/70 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Info size={14} />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  <p className="text-xs">View details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <PopoverContent
              align="center"
              side="right"
              className="w-max p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <VocabularyDetailContent
                item={word}
                topic={currentTopic || undefined}
              />
            </PopoverContent>
          </Popover>

          <div className="absolute -right-1 -top-2">
            {word.isPinned && (
              <Pin
                size={12}
                className="text-orange-500 fill-orange-500 transform rotate-45"
              />
            )}
          </div>
        </div>

        {/* --- BOTTOM RIGHT ACTION PANEL --- */}
        <div
          className="absolute right-1 bottom-0 flex items-center gap-1
                  bg-popover/95 backdrop-blur-sm shadow-md border border-border rounded-full
                  opacity-0 translate-x-2 scale-90 pointer-events-none
                  group-hover/actions:opacity-100 group-hover/actions:translate-x-0 group-hover/actions:scale-100 group-hover/actions:pointer-events-auto
                  transition-all duration-300 ease-out origin-bottom-right z-20"
        >
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 rounded-full transition-colors ${
              word.isLearned
                ? "text-orange-400 dark:text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950"
                : "text-muted-foreground hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLearned(word.id, word.isLearned || false);
            }}
            title={word.isLearned ? "Mark as unlearned" : "Mark as learned"}
          >
            {word.isLearned ? <RotateCcw size={14} /> : <Check size={14} />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
            onClick={(e) => {
              e.stopPropagation();
              onToggleReveal(word.id);
            }}
            title={isMeaningRevealed ? "Hide meaning" : "Show meaning"}
          >
            {isMeaningRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-accent text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditOpen(true);
            }}
            title="Edit word"
          >
            <PenLine size={14} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 rounded-full transition-colors ${
              word.isPinned
                ? "text-orange-500 bg-orange-50 dark:bg-orange-950/30"
                : "text-muted-foreground hover:text-orange-600 hover:bg-orange-50"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(word.id, { isPinned: !word.isPinned });
            }}
            title={word.isPinned ? "Unpin" : "Pin item"}
          >
            <Pin size={14} />
          </Button>

          {isActive ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-blue-500 dark:text-blue-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromPractice(word);
              }}
              title="Remove from lesson"
            >
              <Minus size={14} />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={(e) => {
                e.stopPropagation();
                onAddToPractice(word);
              }}
              title="Add to lesson"
            >
              <Plus size={14} />
            </Button>
          )}
        </div>
      </div>
      {isEditOpen && (
        <EditVocabularyModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          word={word}
          onSave={onUpdate}
          onDelete={onDelete}
        />
      )}
    </>
  );
};
