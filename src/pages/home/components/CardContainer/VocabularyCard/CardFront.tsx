import { cn } from "@/lib/utils";
import { TopicItem, VocabularyItem } from "@/types";
import { CardBottomActions } from "./CardBottomActions";
import { CardFlagControls } from "./CardFlagControls";
import { CardMainContent } from "./CardMainContent";
import { CardTopMeta } from "./CardTopMeta";

interface CardFrontProps {
  item: VocabularyItem;
  currentTopic: TopicItem | undefined;
  topicColorStyle: { text: string };
  isZoomMode: boolean;
  showMeaning: boolean;
  hideImage: boolean;
  loading: boolean;
  isExpanded: boolean;
  onRemove: (e: React.MouseEvent) => void;
  onToggleMeaning: (show: boolean) => void;
  onToggleImage: (hide: boolean) => void;
  onUpdate: (id: string, updates: Partial<VocabularyItem>) => void;
  onMarkLearned: (e: React.MouseEvent) => void;
  onEditOpen: () => void;
  onToggleExpand: (e: React.MouseEvent) => void;
}

export const CardFront: React.FC<CardFrontProps> = ({
  item,
  currentTopic,
  topicColorStyle,
  isZoomMode,
  showMeaning,
  hideImage,
  loading,
  isExpanded,
  onRemove,
  onToggleMeaning,
  onToggleImage,
  onUpdate,
  onMarkLearned,
  onEditOpen,
  onToggleExpand,
}) => {
  return (
    <div
      className={cn(
        "group flex flex-col h-full w-full relative animate-in fade-in zoom-in-95 duration-500 bg-card/0",
      )}
    >
      <CardTopMeta
        item={item}
        currentTopic={currentTopic}
        topicColorStyle={topicColorStyle}
        isZoomMode={isZoomMode}
        onRemove={onRemove}
      />

      <CardFlagControls
        item={item}
        showMeaning={showMeaning}
        hideImage={hideImage}
        isZoomMode={isZoomMode}
        onToggleMeaning={onToggleMeaning}
        onToggleImage={onToggleImage}
      />

      <CardMainContent
        item={item}
        showMeaning={showMeaning}
        hideImage={hideImage}
        isZoomMode={isZoomMode}
      />

      <div
        className={cn("md:opacity-0 md:group-hover:opacity-100 duration-200")}
      >
        <CardBottomActions
          item={item}
          loading={loading}
          isExpanded={isExpanded}
          isZoomMode={isZoomMode}
          onUpdate={onUpdate}
          onMarkLearned={onMarkLearned}
          onEditOpen={onEditOpen}
          onToggleExpand={onToggleExpand}
        />
      </div>
    </div>
  );
};
