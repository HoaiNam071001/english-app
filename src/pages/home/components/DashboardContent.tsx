import { Button } from "@/components/ui/button";
import { useTopics } from "@/hooks/useTopics";
import CreateVocabularyModal from "@/pages/home/components/CreateVocabularyModal";
import FlashcardSection from "@/pages/home/components/FlashcardSection"; // Import Filter type
import TopicList from "@/pages/home/components/TopicList";
import VocabularySidebar from "@/pages/home/components/VocabularySidebar";
import { UserProfile, VocabularyItem } from "@/types";
import { ChevronLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { useVocabulary } from "../../../hooks/useVocabulary";

interface DashboardContentProps {
  user: UserProfile | null;
}

const ALL_TOPIC_KEY = "ALL";

export const DashboardContent = ({ user }: DashboardContentProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Hook Vocabulary
  const {
    allWords,
    displayCards,
    setDisplayCards,
    fetchAllWords,
    updateWord,
    deleteWord,
    bulkDeleteWords,
    toggleLearnedStatus,
    bulkMarkLearned,
    markAsLearned,
    addToPractice,
    removeFromPractice,
    bulkAddToPractice,
    addVocabulary,
    bulkUpdateWords,
  } = useVocabulary();

  const { topics, addTopic, deleteTopic, updateTopic } = useTopics();

  const handleAddWordsToPractice = (newWords: VocabularyItem[]) => {
    // Gọi hàm bulkAddToPractice từ hook (đã có logic check trùng)
    bulkAddToPractice(newWords);
  };

  const filteredWords = useMemo(() => {
    if (!selectedTopicId || selectedTopicId === ALL_TOPIC_KEY) return allWords;
    return allWords.filter((w) => w.topicId === selectedTopicId);
  }, [allWords, selectedTopicId]);

  const currentTopic = topics.find((t) => t.id === selectedTopicId);
  const activeWordIds = useMemo(
    () => new Set(displayCards.map((w) => w.id)),
    [displayCards]
  );

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
    <div className="container mx-auto p-4 md:p-6 max-w-8xl min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6 pb-4 border-b bg-background sticky top-0 z-50">
        <div className="flex items-center gap-4">
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

          <div>
            <div className="text-2xl font-bold text-foreground">
              Vocabulary Manager
            </div>
            <p className="text-sm text-muted-foreground hidden sm:block">
              User: {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CreateVocabularyModal
            onAddVocabulary={handleAddVocabularyWithTopic}
            onSuccess={() => fetchAllWords({ keepFlashcards: true })}
          />
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 gap-2 relative overflow-hidden">
        {/* SIDEBAR AREA (Giữ nguyên) */}
        <div
          className={`
              h-[75vh] transition-all duration-300 ease-in-out border-r bg-card flex flex-col
              ${
                isSidebarOpen
                  ? "w-80 md:w-1/4 opacity-100 translate-x-0 mr-4"
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
                  activeWordIds={activeWordIds}
                  onBulkUpdate={bulkUpdateWords}
                  onAddToPractice={addToPractice}
                  onBulkAddToPractice={bulkAddToPractice}
                  onBulkDelete={bulkDeleteWords}
                  onUpdateWord={updateWord}
                  onDelete={deleteWord}
                  onToggleLearned={toggleLearnedStatus}
                  onBulkMarkLearned={bulkMarkLearned}
                  onRemoveFromPractice={removeFromPractice}
                />
              </div>
            </div>
          )}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 transition-all duration-300 min-w-0 h-[75vh]">
          <FlashcardSection
            displayCards={displayCards}
            setDisplayCards={setDisplayCards}
            onMarkLearned={markAsLearned}
            onUpdateWord={updateWord}
            onDeleteWord={deleteWord}
            allWords={allWords} // Truyền toàn bộ từ
            topics={topics} // Truyền topics
            onAddWords={handleAddWordsToPractice} // Hàm xử lý thêm
          />
        </div>
      </div>
    </div>
  );
};
