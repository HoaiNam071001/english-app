import { Button } from "@/components/ui/button";
import TopicList from "@/pages/home/components/TopicContainer/TopicList";
import VocabularySidebar from "@/pages/home/components/TopicContainer/VocabularySidebar";
import { TopicItem, VocabularyItem } from "@/types";
import { ChevronLeft } from "lucide-react";
import { useMemo } from "react";

const ALL_TOPIC_KEY = "ALL";

interface VocabularySidebarContentProps {
  selectedTopicId: string | null;
  topics: TopicItem[];
  allWords: VocabularyItem[];
  filteredWords: VocabularyItem[];
  mappingActiveWords: Set<string>;
  onSelectTopic: (id: string | null) => void;
  onAddTopic: (label: string) => void;
  onUpdateTopic: (id: string, label: string) => void;
  onDeleteTopic: (id: string) => void;
  onBulkUpdate: (wordIds: string[], updates: Partial<VocabularyItem>) => void;
  onAddToPractice: (word: VocabularyItem) => void;
  onBulkAddToPractice: (words: VocabularyItem[]) => void;
  onBulkDelete: (wordIds: string[]) => void;
  onUpdateWord: (id: string, updates: Partial<VocabularyItem>) => void;
  onDelete: (id: string) => void;
  onToggleLearned: (id: string, isLearned: boolean) => void;
  onBulkMarkLearned: (wordIds: string[], isLearned: boolean) => void;
  batchUpdateWords: (updates: Array<{ id: string; updates: Partial<VocabularyItem> }>) => void;
  onRemoveFromPractice: (word: VocabularyItem) => void;
}

export const VocabularySidebarContent = ({
  selectedTopicId,
  topics,
  allWords,
  filteredWords,
  mappingActiveWords,
  onSelectTopic,
  onAddTopic,
  onUpdateTopic,
  onDeleteTopic,
  onBulkUpdate,
  onAddToPractice,
  onBulkAddToPractice,
  onBulkDelete,
  onUpdateWord,
  onDelete,
  onToggleLearned,
  onBulkMarkLearned,
  batchUpdateWords,
  onRemoveFromPractice,
}: VocabularySidebarContentProps) => {
  const currentTopic = useMemo(
    () => topics.find((t) => t.id === selectedTopicId),
    [topics, selectedTopicId]
  );

  return (
    <>
      {selectedTopicId === null ? (
        <div className="h-full w-full">
          <TopicList
            topics={topics}
            vocabulary={allWords}
            onAddTopic={onAddTopic}
            onUpdateTopic={onUpdateTopic}
            onDeleteTopic={onDeleteTopic}
            onSelectTopic={(id) => onSelectTopic(id || ALL_TOPIC_KEY)}
          />
        </div>
      ) : (
        <div className="h-full w-full flex flex-col">
          <div className="flex items-center gap-2 p-2 border-b bg-muted/50 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectTopic(null)}
              className="gap-1 px-2"
            >
              <ChevronLeft size={16} /> Back
            </Button>
            <span className="font-semibold text-sm truncate">
              {selectedTopicId === ALL_TOPIC_KEY
                ? "All Vocabulary"
                : currentTopic?.label}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <VocabularySidebar
              allWords={filteredWords}
              activeWordIds={mappingActiveWords}
              onBulkUpdate={onBulkUpdate}
              onAddToPractice={onAddToPractice}
              onBulkAddToPractice={onBulkAddToPractice}
              onBulkDelete={onBulkDelete}
              onUpdateWord={onUpdateWord}
              onDelete={onDelete}
              onToggleLearned={onToggleLearned}
              onBulkMarkLearned={onBulkMarkLearned}
              batchUpdateWords={batchUpdateWords}
              onRemoveFromPractice={onRemoveFromPractice}
            />
          </div>
        </div>
      )}
    </>
  );
};

