import DictionarySearchButton from "@/components/DictionarySearchButton";
import { cn } from "@/lib/utils";
import { VocabularyItem } from "@/types";
import {
  Check,
  Maximize2,
  Minimize2,
  PenLine,
  Pin,
  RotateCcw,
} from "lucide-react";
import { Speaker } from "./Speaker";

interface CardBottomActionsProps {
  item: VocabularyItem;
  loading: boolean;
  isExpanded: boolean;
  isZoomMode: boolean;
  onUpdate: (id: string, updates: Partial<VocabularyItem>) => void;
  onMarkLearned: (e: React.MouseEvent) => void;
  onEditOpen: () => void;
  onToggleExpand: (e: React.MouseEvent) => void;
}

export const CardBottomActions: React.FC<CardBottomActionsProps> = ({
  item,
  loading,
  isExpanded,
  isZoomMode,
  onUpdate,
  onMarkLearned,
  onEditOpen,
  onToggleExpand,
}) => {
  // CSS class chung cho các nút tròn
  const btnClass =
    "rounded-full bg-secondary/80 hover:bg-secondary border border-border/50 shadow-sm backdrop-blur-sm transition-all cursor-pointer flex items-center justify-center text-muted-foreground " +
    (isZoomMode ? "scale-[200%]" : "");

  const containerClass = cn(
    "flex flex-col pointer-events-auto",
    isZoomMode ? "gap-10" : "gap-1",
  );

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 w-full z-20 pointer-events-none flex justify-between items-end",
        isZoomMode ? "px-5 pb-2" : "",
      )}
    >
      {/* --- LEFT COLUMN: Speaker, Search, Pin --- */}
      <div className={containerClass}>
        {/* Speaker */}
        <div className={btnClass}>
          <Speaker item={item} />
        </div>

        {/* Dictionary Search */}
        <div className={btnClass}>
          <DictionarySearchButton text={item.text} />
        </div>

        {/* Pin Button */}
        <div
          className={cn(
            btnClass,
            "p-1",
            "hover:bg-background",
            item.isPinned &&
              "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
          )}
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(item.id, { isPinned: !item.isPinned });
          }}
          title={item.isPinned ? "Unpin" : "Pin item"}
        >
          <Pin size={14} className={item.isPinned ? "fill-current" : ""} />
        </div>
      </div>

      {/* --- RIGHT COLUMN: Learned, Edit, Zoom --- */}
      <div className={containerClass}>
        {/* Learned Button */}
        <div
          className={cn(
            btnClass,
            "p-1",
            !item.isLearned
              ? "text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900"
              : "text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900",
          )}
          onClick={onMarkLearned}
          title={item.isLearned ? "Mark as unlearned" : "Mark as learned"}
        >
          {loading ? (
            <span className="animate-spin text-xs">⏳</span>
          ) : item.isLearned ? (
            <RotateCcw size={14} />
          ) : (
            <Check size={14} />
          )}
        </div>

        {/* Edit Button */}
        <div
          className={cn(
            btnClass,
            "p-1",
            "hover:bg-accent hover:text-blue-600 dark:hover:text-blue-400",
          )}
          onClick={(e) => {
            e.stopPropagation();
            onEditOpen();
          }}
          title="Edit word"
        >
          <PenLine size={14} />
        </div>

        {/* Zoom/Expand Button */}
        <div
          className={cn(
            btnClass,
            "p-1",
            "hover:bg-accent hover:text-purple-600",
          )}
          onClick={onToggleExpand}
          title={isExpanded ? "Minimize" : "Maximize"}
        >
          {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </div>
      </div>
    </div>
  );
};
