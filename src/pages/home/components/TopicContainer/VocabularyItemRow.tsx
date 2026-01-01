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
  Eye, // Import lại Eye
  EyeOff, // Import lại EyeOff
  Info,
  Minus,
  PenLine, // Import thêm PenLine cho nút Edit
  Plus,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EditVocabularyModal } from "../common/EditVocabularyModal";
import { VocabularyDetailContent } from "../common/VocabularyDetailContent";

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

  // Lấy style màu từ Constants
  const topicColorStyle = useMemo(() => {
    if (!currentTopic?.color) return { bg: "bg-muted" };
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

      <div className="flex-1 min-w-0 pb-1 cursor-default">
        <div className="flex items-center gap-2">
          {/* Learned Status Icon */}
          {word.isLearned ? (
            <CheckCircle2 size={14} className="text-green-500 shrink-0" />
          ) : (
            <Circle size={14} className="text-muted-foreground shrink-0" />
          )}

          {/* Topic Indicator */}
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

        <div className="mt-1 relative w-fit h-[16px]">
          {/* Layer Text hiển thị nghĩa - KHÔNG CÒN Click để Show/Hide */}
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

      {/* Action Buttons Panel */}
      <div
        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1
                  bg-popover/95 backdrop-blur-sm shadow-md border border-border rounded-full p-1
                  opacity-0 translate-x-2 scale-90 pointer-events-none
                  group-hover/actions:opacity-100 group-hover/actions:translate-x-0 group-hover/actions:scale-100 group-hover/actions:pointer-events-auto
                  transition-all duration-300 ease-out origin-right z-20"
      >
        {/* 1. Toggle Learned Button */}
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

        {/* 2. [NEW] Show/Hide Meaning Button */}
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
              <p className="text-xs">
                {isMeaningRevealed ? "Hide meaning" : "Show meaning"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 3. [NEW] Edit Button (Moved here) */}
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

        {/* 4. Detail Info Button */}
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Info size={14} />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">View details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <PopoverContent
            align="center"
            side="right"
            className="w-max p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <VocabularyDetailContent
              item={word}
              topic={currentTopic || undefined}
            />
          </PopoverContent>
        </Popover>

        {/* 5. Add/Remove Practice Button */}
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

      {/* 1. COMPONENT EDIT MODAL RIÊNG BIỆT */}
      {isEditOpen && (
        <EditVocabularyModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          word={word}
          onSave={onUpdate}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};
