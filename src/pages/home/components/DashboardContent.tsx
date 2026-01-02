import { Button } from "@/components/ui/button";
import { useTopics } from "@/hooks/useTopics";
import { useVocabulary } from "@/hooks/useVocabulary";
import TopicList from "@/pages/home/components/TopicContainer/TopicList";
import VocabularySidebar from "@/pages/home/components/TopicContainer/VocabularySidebar";
import { UserProfile, VocabularyItem } from "@/types";
import { ChevronLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import CardContainer, { CardContainerRef } from "./CardContainer";

interface DashboardContentProps {
  user: UserProfile | null;
}

const ALL_TOPIC_KEY = "ALL";

export const DashboardContent = ({ user }: DashboardContentProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const cardContainerRef = useRef<CardContainerRef>(null);

  const {
    allWords,
    isLoaded,
    fetchAllWords,
    updateWord,
    deleteWord,
    bulkDeleteWords,
    toggleLearnedStatus,
    bulkMarkLearned,
    markAsLearned,
    addVocabulary,
    bulkUpdateWords,
    batchUpdateWords,
  } = useVocabulary();
  const [mappingActiveWords, setMappingActiveWords] = useState<Set<string>>(
    new Set()
  );

  const onFetch = async () => {
    await fetchAllWords(false);
  };

  useEffect(() => {
    onFetch();
  }, [user]);

  const { topics, addTopic, deleteTopic, updateTopic } = useTopics();

  // Handle: Sidebar -> CardContainer
  const handleAddWordsToPractice = (newWords: VocabularyItem[]) => {
    if (cardContainerRef.current) {
      cardContainerRef.current.addWordsToSession(newWords);
    }
  };

  const handleRemoveWordsToPractice = (words: VocabularyItem[]) => {
    if (cardContainerRef.current) {
      cardContainerRef.current.removeWordsToSession(
        words?.map((e) => e.id) || []
      );
    }
  };

  const filteredWords = useMemo(() => {
    if (!selectedTopicId || selectedTopicId === ALL_TOPIC_KEY) return allWords;
    return allWords.filter((w) => w.topicId === selectedTopicId);
  }, [allWords, selectedTopicId]);

  const currentTopic = topics.find((t) => t.id === selectedTopicId);

  const handleAddVocabularyWithTopic = async (entries: VocabularyItem[]) => {
    const entriesWithTopic = entries.map((e) => ({
      ...e,
      topicId:
        selectedTopicId && selectedTopicId !== ALL_TOPIC_KEY
          ? selectedTopicId
          : undefined,
    }));
    return await addVocabulary(entriesWithTopic);
  };

  return (
    <div className="flex flex-col">
      {/* MAIN LAYOUT */}
      <div className="flex flex-1 gap-2 relative overflow-hidden">
        {/* SIDEBAR AREA */}
        <div
          className={`
              h-[80vh] transition-all duration-300 ease-in-out border-r bg-card flex flex-col
              ${
                isSidebarOpen
                  ? "w-80 md:w-1/4 opacity-100 translate-x-0"
                  : "w-0 opacity-0 -translate-x-full mr-0 overflow-hidden border-none"
              }
          `}
        >
          {selectedTopicId === null ? (
            <div className="h-full w-80 md:w-auto">
              <TopicList
                topics={topics}
                vocabulary={allWords}
                onAddTopic={addTopic}
                onUpdateTopic={updateTopic}
                onDeleteTopic={deleteTopic}
                onSelectTopic={(id) => setSelectedTopicId(id || ALL_TOPIC_KEY)}
              />
            </div>
          ) : (
            <div className="h-full w-80 md:w-auto flex flex-col">
              <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTopicId(null)}
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
                  onBulkUpdate={bulkUpdateWords}
                  onAddToPractice={(word) => handleAddWordsToPractice([word])}
                  onBulkAddToPractice={handleAddWordsToPractice}
                  onBulkDelete={bulkDeleteWords}
                  onUpdateWord={updateWord}
                  onDelete={deleteWord}
                  onToggleLearned={toggleLearnedStatus}
                  onBulkMarkLearned={bulkMarkLearned}
                  batchUpdateWords={batchUpdateWords}
                  onRemoveFromPractice={(value) =>
                    handleRemoveWordsToPractice([value])
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="relative flex-1 transition-all duration-300 min-w-0 h-[80vh]">
          <div className="absolute top-1 left-0 z-100">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-foreground"
            >
              {isSidebarOpen ? (
                <PanelLeftClose size={20} />
              ) : (
                <PanelLeftOpen size={20} />
              )}
            </Button>
          </div>
          <CardContainer
            ref={cardContainerRef}
            allWords={allWords}
            isLoaded={isLoaded}
            topics={topics}
            onActiveChanged={setMappingActiveWords}
            onMarkLearned={markAsLearned}
            onUpdateWord={updateWord}
            onDeleteWord={deleteWord}
            handleAddVocabulary={handleAddVocabularyWithTopic}
          />
        </div>
      </div>
    </div>
  );
};
