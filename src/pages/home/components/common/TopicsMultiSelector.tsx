import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTopics } from "@/hooks/useTopics";
import { cn } from "@/lib/utils";
import { getColorStyle, getIconComponent } from "@/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface TopicsMultiSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

// Multi-select chủ đề, giao diện đồng bộ với WordTypeSelector (badge đã chọn + popover danh sách).
export const TopicsMultiSelector: React.FC<TopicsMultiSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  const { t } = useTranslation(["home", "common"]);
  const { topics } = useTopics();

  const selectedIds = useMemo(() => new Set(value || []), [value]);
  const selectedTopics = topics.filter((tp) => selectedIds.has(tp.id));

  const toggleTopic = (topicId: string) => {
    const next = new Set(selectedIds);
    if (next.has(topicId)) next.delete(topicId);
    else next.add(topicId);
    onChange(Array.from(next));
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between h-auto min-h-9 px-3 py-1 font-normal text-left",
            className,
          )}
        >
          <div className="flex flex-wrap gap-1 items-center flex-1 mr-2">
            {selectedTopics.length > 0 ? (
              selectedTopics.map((topic) => {
                const colorStyle = getColorStyle(topic.color);
                return (
                  <div
                    key={topic.id}
                    className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border",
                      colorStyle.badge,
                    )}
                  >
                    {topic.label}
                  </div>
                );
              })
            ) : (
              <span className="text-muted-foreground text-sm">
                {t("review.filter.allTopics")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {selectedIds.size > 0 && (
              <div
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-sm hover:bg-accent transition-colors"
              >
                <X size={14} />
              </div>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0" align="start">
        <ScrollArea className="h-[200px]">
          <div className="p-1 space-y-1">
            {topics.map((topic) => {
              const isSelected = selectedIds.has(topic.id);
              const colorStyle = getColorStyle(topic.color);
              const TopicIcon = getIconComponent(topic.icon);
              return (
                <div
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer text-sm transition-colors",
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  <div className={cn("p-1 rounded-md", colorStyle.badge)}>
                    <TopicIcon size={12} />
                  </div>
                  <span className="flex-1 truncate text-xs">{topic.label}</span>
                  {isSelected && <Check size={14} className="opacity-70" />}
                </div>
              );
            })}
            {topics.length === 0 && (
              <div className="text-xs text-center py-4 text-muted-foreground">
                {t("addCards.noTopics")}
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
