import { Button } from "@/components/ui/button";
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
import { Phonetics } from "@/pages/home/components/common/Phonetic";
import { VocabularyDetailContent } from "@/pages/home/components/common/VocabularyDetailContent";
import { VocabularyItem } from "@/types";
import {
  AlertTriangle, // Import thêm icon này
  Check,
  Copy,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import React, { useState } from "react";

interface SharedItemProps {
  word: VocabularyItem;
  isSelected: boolean;
  isRevealed?: boolean;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onToggleReveal?: (id: string) => void;
  onImport?: (words: VocabularyItem[]) => void;
  hideImportAction?: boolean;
  isWarning?: boolean; // Prop này đã có sẵn từ code của bạn
}

export const SharedItem: React.FC<SharedItemProps> = ({
  word,
  isSelected,
  isRevealed = false,
  onToggleSelect,
  onToggleReveal,
  onImport,
  hideImportAction = false,
  isWarning = false,
}) => {
  const [isImportedLocal, setIsImportedLocal] = useState(false);
  const [localReveal, setLocalReveal] = useState(isRevealed);
  const currentRevealed = onToggleReveal ? isRevealed : localReveal;

  const handleToggleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleReveal) {
      onToggleReveal(word.id);
    } else {
      setLocalReveal(!localReveal);
    }
  };

  const handleImportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImport) {
      onImport([word]);
      setIsImportedLocal(true);
      setTimeout(() => setIsImportedLocal(false), 2000);
    }
  };

  return (
    <div
      onClick={(e) => onToggleSelect(word.id, e)}
      className={`
        relative select-none group/actions p-3 text-sm border rounded-lg transition-all flex flex-col gap-1 cursor-pointer h-full
        ${
          isSelected
            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm ring-1 ring-blue-500/20"
            : "bg-card hover:border-blue-400/50"
        }
      `}
    >
      {/* Header: Text + Phonetic + Checkbox */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0 w-full">
          <div className="flex items-center gap-2">
            {/* Checkbox ảo visual */}
            <div
              className={`
                w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0
                ${
                  isSelected
                    ? "bg-blue-500 border-blue-500"
                    : "border-muted-foreground/30"
                }
            `}
            >
              {isSelected && <Check size={10} className="text-white" />}
            </div>

            {/* Word Text */}
            <span className="font-bold text-base text-foreground tracking-tight truncate">
              {word.text}
            </span>

            {/* [NEW] Warning Icon */}
            <div className="ml-auto text-orange-500 dark:text-orange-400 shrink-0 animate-in fade-in zoom-in duration-300">
              {isWarning && (
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      {/* Note: Icon AlertTriangle với fill trick để tạo nền nhẹ bên trong nếu muốn, hoặc dùng mặc định */}
                      <AlertTriangle size={14} />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Already exists in your library</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          <div className="ml-6">
            <Phonetics item={word} />
          </div>
        </div>
      </div>

      {/* Meaning Section */}
      <div className="relative mt-1">
        <p
          className={`text-[13px] text-muted-foreground transition-all duration-300 truncate ${
            !currentRevealed
              ? "blur-[5px] select-none opacity-50"
              : "blur-0 opacity-100"
          }`}
        >
          {word.meaning}
        </p>
      </div>

      {/* Action Buttons Toolbar - ABSOLUTE OVERLAY */}
      <div
        className="absolute right-2 bottom-2 flex items-center gap-1
                   opacity-0 group-hover/actions:opacity-100 transition-all duration-200
                   bg-popover/90 backdrop-blur-md shadow-md border rounded-full z-10 translate-y-2 group-hover/actions:translate-y-0 px-1 py-0.5"
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          onClick={handleToggleReveal}
        >
          {currentRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <Info size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="center"
            className="w-max p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <VocabularyDetailContent item={word} />
          </PopoverContent>
        </Popover>

        {!hideImportAction && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isImportedLocal ? "default" : "ghost"}
                  size="icon"
                  className={`h-7 w-7 rounded-full transition-all ${
                    isImportedLocal
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "text-muted-foreground hover:text-blue-500"
                  }`}
                  onClick={handleImportClick}
                >
                  {isImportedLocal ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isImportedLocal
                    ? "Added to your list"
                    : "Import to my vocabulary"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};
