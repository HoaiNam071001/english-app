import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TopicItem, VocabularyItem } from "@/types";
import { getIconComponent } from "@/utils";
import { Info, X } from "lucide-react";
import { WordTypeIndicator } from "../../common/WordTypeIndicator";
import { VocabularyDetailPopup } from "../../common/VocabularyDetailPopup";

export interface CardTopMetaProps {
  item: VocabularyItem;
  currentTopic: TopicItem | undefined;
  topicColorStyle: { text: string };
  isZoomMode: boolean;
  onRemove: (e: React.MouseEvent) => void;
}

export const CardTopMeta: React.FC<CardTopMetaProps> = ({
  item,
  currentTopic,
  topicColorStyle,
  isZoomMode,
  onRemove,
}) => {
  const renderTopicIcon = () => {
    if (!currentTopic) return null;
    const TopicIcon = getIconComponent(currentTopic.icon || "folder");
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <TopicIcon className={`w-4 ${topicColorStyle.text}`} />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Topic: {currentTopic.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="absolute -top-1 left-0 flex items-center gap-1 z-30 w-full px-1">
      {!isZoomMode && (
        <div
          className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          onClick={onRemove}
          title="Remove"
        >
          <X size={14} />
        </div>
      )}
      <WordTypeIndicator typeIds={item.typeIds} />
      <div className="ml-auto flex gap-1 items-center">
        {renderTopicIcon()}
        {/* Info Button */}
        <div onClick={(e) => e.stopPropagation()}>
          <VocabularyDetailPopup
            item={item}
            topic={currentTopic || undefined}
            side="right"
            align="center"
            trigger={
              <div
                className="p-1 rounded-full hover:bg-background hover:text-blue-500 transition-all cursor-pointer text-muted-foreground"
                title="View details"
              >
                <Info size={14} />
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};
