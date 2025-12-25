import CreateVocabularyModal from "@/components/CreateVocabularyModal";
import EmailEntry from "@/components/EmailEntry";
import FlashcardSection from "@/components/FlashcardSection";
import { Button } from "@/components/ui/button";
import VocabularySidebar from "@/components/VocabularySidebar";
import { STORAGE_KEY } from "@/constants";
import { useVocabulary } from "@/hooks/useVocabulary";
import {
  ChevronRight,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const HomePage = () => {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // === SỬ DỤNG HOOK ===
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
  } = useVocabulary(currentUserEmail);

  // Authentication Effect
  useEffect(() => {
    const savedEmail = localStorage.getItem(STORAGE_KEY.EMAIL_CACHE_KEY);
    if (savedEmail) {
      setCurrentUserEmail(savedEmail);
    }
  }, []);

  const handleLogin = (email: string) => {
    setCurrentUserEmail(email);
    localStorage.setItem(STORAGE_KEY.EMAIL_CACHE_KEY, email);
  };

  const handleLogout = () => {
    setCurrentUserEmail(null);
    localStorage.removeItem(STORAGE_KEY.EMAIL_CACHE_KEY);
  };

  const activeWordIds = useMemo(() => {
    return new Set(displayCards.map((w) => w.id));
  }, [displayCards]);

  if (!currentUserEmail) {
    return <EmailEntry onSubmit={handleLogin} />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-8xl min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6 pb-4 border-b bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? "Thu gọn danh sách" : "Mở danh sách"}
            className="text-slate-600"
          >
            {isSidebarOpen ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelLeftOpen size={20} />
            )}
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Vocabulary Manager
            </h1>
            <p className="text-sm text-slate-500 hidden sm:block">
              User: {currentUserEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CreateVocabularyModal
            onAddVocabulary={addVocabulary}
            onSuccess={() => fetchAllWords({ keepFlashcards: true })}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
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
                h-[75vh] transition-all duration-300 ease-in-out border-r bg-white
                ${
                  isSidebarOpen
                    ? "w-80 md:w-1/4 opacity-100 translate-x-0 mr-4"
                    : "w-0 opacity-0 -translate-x-full mr-0 overflow-hidden border-none"
                }
            `}
        >
          <div className="h-full w-80 md:w-auto">
            <VocabularySidebar
              allWords={allWords}
              activeWordIds={activeWordIds}
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

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 transition-all duration-300 min-w-0 h-[75vh]">
          {!isSidebarOpen && (
            <div className="absolute top-0 left-0 z-10">
              <Button
                variant="outline"
                size="sm"
                className="shadow-md bg-white border-dashed text-slate-500 hover:text-blue-600 mb-4"
                onClick={() => setIsSidebarOpen(true)}
              >
                <ChevronRight size={16} className="mr-1" /> Mở danh sách
              </Button>
            </div>
          )}

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

export default HomePage;
