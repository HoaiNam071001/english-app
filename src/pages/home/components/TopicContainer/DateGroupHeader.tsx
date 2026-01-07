import { Checkbox } from "@/components/ui/checkbox";
import { formatDateGroup } from "@/utils";
import { ChevronDown, ChevronRight, Pin } from "lucide-react";
import React from "react";

interface DateGroupHeaderProps {
  dateKey: string;
  count: number;
  allSelected: boolean;
  isCollapsed: boolean;
  onSelect: () => void;
  onToggle: () => void;
  customTitle?: string;
  isPinnedGroup?: boolean;
}

export const DateGroupHeader = React.memo<DateGroupHeaderProps>(
  ({
    dateKey,
    count,
    allSelected,
    onSelect,
    isCollapsed,
    onToggle,
    customTitle,
    isPinnedGroup,
  }) => {
    return (
      <div
        onClick={onSelect}
        title="Click to select all items in this group"
        className={`
        sticky top-0 z-20 px-2 py-2 mb-2
        text-xs font-bold uppercase tracking-wider border-b border-border
        flex items-center justify-between cursor-pointer transition-colors
        bg-card/95 backdrop-blur-sm shadow-sm select-none
        ${
          allSelected
            ? "text-blue-700 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/30"
            : "text-blue-600 dark:text-blue-400"
        }
      `}
      >
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            className="h-4 w-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <div className="flex items-center gap-1">
            {isPinnedGroup && <Pin size={12} className="fill-current mr-1" />}
            <span>{customTitle || formatDateGroup(dateKey)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`px-1.5 rounded-full text-[10px] ${
              allSelected
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {count}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="py-0.5 px-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-sm transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
        </div>
      </div>
    );
  }
);
