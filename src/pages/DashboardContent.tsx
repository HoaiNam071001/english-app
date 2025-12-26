


import CreateVocabularyModal from "@/components/CreateVocabularyModal";
import EmailEntry from "@/components/EmailEntry";
import FlashcardSection from "@/components/FlashcardSection";
import TopicList from "@/components/TopicList";
import { Button } from "@/components/ui/button";
import VocabularySidebar from "@/components/VocabularySidebar";
import { TopicProvider } from "@/contexts/TopicContext";
import { useTopics } from "@/hooks/useTopics";
import { useVocabulary } from "@/hooks/useVocabulary";
import { auth } from "@/firebaseConfig"; // <--- IMPORT AUTH
import { onAuthStateChanged, signOut, User } from "firebase/auth"; // <--- IMPORT FIREBASE AUTH METHODS
import {
  ChevronLeft,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Loader2 // Import icon loading
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { UserProfile } from "@/types";

interface DashboardContentProps {
  user: UserProfile;
  onLogout: () => void;
}

export const DashboardContent = ({ user, onLogout }: DashboardContentProps) => {
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
} = useVocabulary(user.id!);
  // Hook Topics (GỌI Ở ĐÂY LÀ HỢP LỆ)
  const { topics, addTopic, deleteTopic, updateTopic } = useTopics();

  // Logic lọc từ theo chủ đề
  const filteredWords = useMemo(() => {
    if (!selectedTopicId || selectedTopicId === "ALL") return allWords;
    return allWords.filter((w) => w.topicId === selectedTopicId);
  }, [allWords, selectedTopicId]);

  const currentTopic = topics.find((t) => t.id === selectedTopicId);

  const handleAddVocabularyWithTopic = async (
    entries: { text: string; meaning: string; normalized: string }[]
  ) => {
    const entriesWithTopic = entries.map((e) => ({
      ...e,
      topicId:
        selectedTopicId && selectedTopicId !== "ALL"
          ? selectedTopicId
          : undefined,
    }));
    return await addVocabulary(entriesWithTopic);
  };

  const activeWordIds = useMemo(
    () => new Set(displayCards.map((w) => w.id)),
    [displayCards]
  );

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-8xl min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6 pb-4 border-b bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-600"
          >
            {isSidebarOpen ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelLeftOpen size={20} />
            )}
          </Button>

          <div>
            <div className="text-2xl font-bold">
              Vocabulary Manager
            </div>
            <p className="text-sm text-slate-500 hidden sm:block">
              User: {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CreateVocabularyModal
            onAddVocabulary={handleAddVocabularyWithTopic}
            onSuccess={() => fetchAllWords({ keepFlashcards: true })}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-slate-500"
          >
            <LogOut size={16} className="mr-2" />{" "}
            <span className="hidden sm:inline">Thoát</span>
          </Button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 gap-2 relative overflow-hidden">
        {/* SIDEBAR AREA */}
        <div
          className={`
              h-[75vh] transition-all duration-300 ease-in-out border-r bg-white flex flex-col
              ${
                isSidebarOpen
                  ? "w-80 md:w-1/4 opacity-100 translate-x-0 mr-4"
                  : "w-0 opacity-0 -translate-x-full mr-0 overflow-hidden border-none"
              }
          `}
        >
          {selectedTopicId === null ? (
            // VIEW 1: TOPIC LIST
            <div className="h-full w-80 md:w-auto">
              <TopicList
                topics={topics}
                vocabulary={allWords}
                onAddTopic={addTopic}
                onUpdateTopic={updateTopic}
                onDeleteTopic={deleteTopic}
                onSelectTopic={(id) => setSelectedTopicId(id || "ALL")}
              />
            </div>
          ) : (
            // VIEW 2: VOCABULARY LIST
            <div className="h-full w-80 md:w-auto flex flex-col">
              <div className="flex items-center gap-2 p-2 border-b bg-slate-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTopicId(null)}
                  className="gap-1 px-2"
                >
                  <ChevronLeft size={16} /> Back
                </Button>
                <span className="font-semibold text-sm truncate">
                  {selectedTopicId === "ALL"
                    ? "Tất cả từ vựng"
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
          />
        </div>
      </div>
    </div>
  );
};
