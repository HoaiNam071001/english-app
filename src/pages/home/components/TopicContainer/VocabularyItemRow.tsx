import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VocabularyItem } from "@/types";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TOPIC_COLORS } from "@/constants"; // <--- 1. Import Constants
import { useTopics } from "@/hooks/useTopics";
import {
  Check,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { EditPopoverContent } from "../common/EditPopoverContent";

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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // 2. Tìm Topic hiện tại của từ
  const currentTopic = useMemo(() => {
    if (!word.topicId) return null;
    return topics.find((t) => t.id === word.topicId);
  }, [word.topicId, topics]);

  // 3. Lấy style màu từ Constants
  const topicColorStyle = useMemo(() => {
    if (!currentTopic?.color) return { bg: "bg-muted" }; // Mặc định nếu không có topic
    return (
      TOPIC_COLORS.find((c) => c.id === currentTopic.color) || {
        bg: "bg-muted",
      }
    );
  }, [currentTopic]);

  return (
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
    >
      {/* Checkbox Wrapper */}
      <div
        className="pt-1 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelection(word.id, e);
        }}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => {}}
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 pointer-events-none"
        />
      </div>

      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <div className="flex-1 min-w-0 cursor-pointer pb-1">
            <div className="flex items-center gap-2">
              {/* Learned Status Icon */}
              {word.isLearned ? (
                <CheckCircle2 size={14} className="text-green-500 shrink-0" />
              ) : (
                <Circle size={14} className="text-muted-foreground shrink-0" />
              )}

              {/* 4. Topic Indicator (Chấm màu) */}
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

              {/* Vocabulary Text */}
              <span
                className={`font-medium truncate max-w-[200px] ${
                  word.isLearned && !isActive
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {word.text}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2">
              <div
                className={`text-xs text-muted-foreground transition-all duration-300 h-[16px] max-w-[200px] ${
                  !isMeaningRevealed
                    ? "blur-[5px] select-none opacity-60"
                    : "blur-0 opacity-100"
                }`}
              >
                {word.meaning}
              </div>
            </div>
          </div>
        </PopoverTrigger>

        {/* Edit Form */}
        <PopoverContent align="start" side="right" className="p-4 w-90">
          <EditPopoverContent
            word={word}
            onSave={onUpdate}
            onDelete={onDelete}
            onClose={() => setIsPopoverOpen(false)}
          />
        </PopoverContent>
      </Popover>

      {/* Action Buttons Panel */}
      <div
        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1
                  bg-popover/95 backdrop-blur-sm shadow-md border border-border rounded-full p-1
                  opacity-0 translate-x-2 scale-90 pointer-events-none
                  group-hover/actions:opacity-100 group-hover/actions:translate-x-0 group-hover/actions:scale-100 group-hover/actions:pointer-events-auto
                  transition-all duration-300 ease-out origin-right z-20"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
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
              >
                {word.isLearned ? <RotateCcw size={14} /> : <Check size={14} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">
                {word.isLearned ? "Mark as unlearned" : "Mark as learned"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleReveal(word.id);
                }}
              >
                {isMeaningRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Show/Hide meaning</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isActive ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-blue-500 dark:text-blue-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromPractice(word);
                  }}
                >
                  <Minus size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Remove from lesson</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-muted-foreground hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToPractice(word);
                  }}
                >
                  <Plus size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Add to lesson</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};
