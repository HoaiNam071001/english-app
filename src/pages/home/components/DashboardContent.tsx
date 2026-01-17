import { CommonModal } from "@/components/CommonModal";
import { useTopics } from "@/hooks/useTopics";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useWordTypes } from "@/hooks/useWordTypes";
import { UserProfile, VocabularyItem } from "@/types";
import { useEffect, useMemo, useRef, useState } from "react";
import CardContainer, { CardContainerRef } from "./CardContainer";
import { VocabularySidebarContent } from "./VocabularySidebarContent";

interface DashboardContentProps {
  user: UserProfile | null;
}

const ALL_TOPIC_KEY = "ALL";

export const DashboardContent = ({ user }: DashboardContentProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarModalOpen, setIsSidebarModalOpen] = useState(false);
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
  const { fetch: fetchWordTypes } = useWordTypes();
  const [mappingActiveWords, setMappingActiveWords] = useState<Set<string>>(
    new Set(),
  );

  const onFetch = async () => {
    await fetchAllWords(false);
  };

  useEffect(() => {
    onFetch();
    fetchWordTypes();
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
        words?.map((e) => e.id) || [],
      );
    }
  };

  const filteredWords = useMemo(() => {
    if (!selectedTopicId || selectedTopicId === ALL_TOPIC_KEY) return allWords;
    return allWords.filter((w) => w.topicId === selectedTopicId);
  }, [allWords, selectedTopicId]);

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

  // Sidebar content component props
  const sidebarContentProps = {
    selectedTopicId,
    topics,
    allWords,
    filteredWords,
    mappingActiveWords,
    onSelectTopic: setSelectedTopicId,
    onAddTopic: addTopic,
    onUpdateTopic: updateTopic,
    onDeleteTopic: deleteTopic,
    onBulkUpdate: bulkUpdateWords,
    onAddToPractice: (word: VocabularyItem) => handleAddWordsToPractice([word]),
    onBulkAddToPractice: handleAddWordsToPractice,
    onBulkDelete: bulkDeleteWords,
    onUpdateWord: updateWord,
    onDelete: deleteWord,
    onToggleLearned: toggleLearnedStatus,
    onBulkMarkLearned: bulkMarkLearned,
    batchUpdateWords,
    onRemoveFromPractice: (value: VocabularyItem) =>
      handleRemoveWordsToPractice([value]),
  };

  return (
    <div className="flex flex-col">
      {/* MAIN LAYOUT */}
      <div className="flex flex-1 gap-2 relative overflow-hidden">
        {/* SIDEBAR AREA - Desktop: Sidebar, Mobile: Hidden (use modal instead) */}
        <div
          className={`
              h-[80vh] transition-all duration-300 ease-in-out border-r bg-card flex flex-col
              hidden md:flex
              ${
                isSidebarOpen
                  ? "w-80 md:w-1/4 opacity-100 translate-x-0"
                  : "w-0 opacity-0 -translate-x-full mr-0 overflow-hidden border-none"
              }
          `}
        >
          <VocabularySidebarContent {...sidebarContentProps} />
        </div>

        {/* SIDEBAR MODAL - Mobile only */}
        <CommonModal
          open={isSidebarModalOpen}
          onOpenChange={setIsSidebarModalOpen}
          title="Topics & Vocabulary"
          closeOnInteractOutside={true}
          footer={null}
          contentClassName={"overflow-hidden"}
        >
          <div className="w-full h-[70vh] flex flex-col overflow-hidden">
            <VocabularySidebarContent {...sidebarContentProps} />
          </div>
        </CommonModal>

        {/* MAIN CONTENT AREA */}
        <div className="relative flex-1 transition-all duration-300 min-w-0 h-[90vh] md:h-[80vh]">
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
            onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
            onSidebarModalOpen={() => setIsSidebarModalOpen(true)}
          />
        </div>
      </div>
    </div>
  );
};
