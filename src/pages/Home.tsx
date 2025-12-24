import CreateVocabularyModal from "@/components/CreateVocabularyModal";
import EmailEntry from "@/components/EmailEntry";
import FlashcardSection from "@/components/FlashcardSection";
import { Button } from "@/components/ui/button";
import VocabularySidebar from "@/components/VocabularySidebar";
import { db } from "@/firebaseConfig";
import { DataTable, VocabularyItem } from "@/types";
import { isToday } from "@/utils";
import {
  collection,
  deleteDoc, // <--- 1. Import deleteDoc
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  ChevronRight,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const HomePage = () => {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [allWords, setAllWords] = useState<VocabularyItem[]>([]);
  const [displayCards, setDisplayCards] = useState<VocabularyItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const fetchAllWords = async () => {
    // ... Giữ nguyên logic cũ
    if (!currentUserEmail) return;
    try {
      const q = query(
        collection(db, DataTable.Vocabulary),
        where("email", "==", currentUserEmail),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const fetchedWords = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || 0,
        isLearned: doc.data().isLearned || false,
      })) as VocabularyItem[];

      setAllWords(fetchedWords);
      setDisplayCards(
        fetchedWords?.filter((w) => isToday(w.createdAt) && !w.isLearned)
      );
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    }
  };

  const handleUpdateWord = async (
    id: string,
    newText: string,
    newMeaning: string
  ) => {
    setAllWords((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, text: newText, meaning: newMeaning } : w
      )
    );
    setDisplayCards((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, text: newText, meaning: newMeaning } : w
      )
    );

    // Update Firebase
    await updateDoc(doc(db, DataTable.Vocabulary, id), {
      text: newText,
      meaning: newMeaning,
    });
  };

  useEffect(() => {
    fetchAllWords();
  }, [currentUserEmail]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("vocab_user_email");
    if (savedEmail) {
      setCurrentUserEmail(savedEmail);
    }
  }, []);

  const handleLogin = (email: string) => {
    setCurrentUserEmail(email);
    localStorage.setItem("vocab_user_email", email);
  };

  const handleLogout = () => {
    setCurrentUserEmail(null);
    localStorage.removeItem("vocab_user_email");
  };

  const handleBulkAddToPractice = (words: VocabularyItem[]) => {
    setDisplayCards((prev) => {
      const existingIds = new Set(prev.map((w) => w.id));
      const newWords = words
        .filter((w) => !existingIds.has(w.id))
        .map((w) => ({ ...w, isLearned: false }));
      return [...newWords, ...prev];
    });
  };

  // 2. Thêm hàm Bulk Delete
  const handleBulkDelete = async (ids: string[]) => {
    // Xử lý UI
    setAllWords((prev) => prev.filter((w) => !ids.includes(w.id)));
    setDisplayCards((prev) => prev.filter((w) => !ids.includes(w.id)));

    // Xử lý Firebase (dùng batch)
    const batch = writeBatch(db);
    ids.forEach((id) => batch.delete(doc(db, DataTable.Vocabulary, id)));
    await batch.commit();
  };

  const handleMarkAsLearned = async (id: string) => {
    setAllWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isLearned: true } : w))
    );
    setDisplayCards((prev) => prev.filter((w) => w.id !== id));

    try {
      const docRef = doc(db, DataTable.Vocabulary, id);
      await updateDoc(docRef, { isLearned: true });
    } catch (error) {
      console.error("Lỗi update DB:", error);
    }
  };

  const handleAddToPractice = (word: VocabularyItem) => {
    const exists = displayCards.find((w) => w.id === word.id);
    if (!exists) {
      const wordToPractice = { ...word, isLearned: false };
      setDisplayCards((prev) => [wordToPractice, ...prev]);
    }
  };

  // 2. Thêm hàm XÓA TỪ (DELETE)
  const handleDeleteWord = async (id: string) => {
    // A. Update UI ngay lập tức
    setAllWords((prev) => prev.filter((w) => w.id !== id));
    setDisplayCards((prev) => prev.filter((w) => w.id !== id));

    // B. Xóa trong Database
    try {
      await deleteDoc(doc(db, DataTable.Vocabulary, id));
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    }
  };

  const handleToggleLearned = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // 1. Update UI (All Words)
    setAllWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isLearned: newStatus } : w))
    );

    // 2. Nếu đánh dấu là "Đã thuộc" -> Xóa khỏi Flashcard (displayCards)
    if (newStatus === true) {
      setDisplayCards((prev) => prev.filter((w) => w.id !== id));
    }

    // 3. Update Firestore
    try {
      await updateDoc(doc(db, DataTable.Vocabulary, id), {
        isLearned: newStatus,
      });
    } catch (error) {
      console.error("Lỗi update status:", error);
    }
  };

  const handleBulkMarkLearned = async (ids: string[], status: boolean) => {
    // 1. Update UI
    setAllWords(
      (prev) =>
        prev.map((w) => (ids.includes(w.id) ? { ...w, isLearned: status } : w)) // status từ tham số
    );

    // Nếu status là true (đã thuộc) thì xóa khỏi card đang học
    if (status === true) {
      setDisplayCards((prev) => prev.filter((w) => !ids.includes(w.id)));
    }

    // 2. Batch Update Firestore
    try {
      const batch = writeBatch(db);
      ids.forEach((id) => {
        const docRef = doc(db, DataTable.Vocabulary, id);
        batch.update(docRef, { isLearned: status }); // status từ tham số
      });
      await batch.commit();
    } catch (error) {
      console.error("Lỗi bulk update:", error);
    }
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
          {/* 3. Nút Toggle Sidebar trên Header (Mobile hoặc Desktop đều dùng được) */}
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
          {/* Nút Create Modal */}
          <CreateVocabularyModal
            userEmail={currentUserEmail}
            onSuccess={fetchAllWords}
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
      <div className="flex flex-1 gap-6 relative overflow-hidden">
        {/* 4. SIDEBAR AREA */}
        <div
          className={`
                transition-all duration-300 ease-in-out border-r bg-white
                ${
                  isSidebarOpen
                    ? "w-80 md:w-1/4 opacity-100 translate-x-0 mr-4"
                    : "w-0 opacity-0 -translate-x-full mr-0 overflow-hidden border-none"
                }
            `}
        >
          {/* Nội dung Sidebar - Chỉ render hoặc giữ nguyên trong DOM nhưng bị ẩn */}
          <div className="h-full w-80 md:w-auto">
            {" "}
            {/* Wrapper để giữ width nội dung không bị bóp méo khi transition */}
            <VocabularySidebar
              allWords={allWords}
              activeWordIds={activeWordIds}
              onAddToPractice={handleAddToPractice}
              onBulkAddToPractice={handleBulkAddToPractice}
              onBulkDelete={handleBulkDelete}
              onUpdateWord={handleUpdateWord}
              onDelete={handleDeleteWord}
              onToggleLearned={handleToggleLearned}
              onBulkMarkLearned={handleBulkMarkLearned}
              onRemoveFromPractice={(word) => {
                setDisplayCards((prev) => prev.filter((w) => w.id !== word.id));
              }}
            />
          </div>
        </div>

        {/* 5. MAIN CONTENT AREA (Flashcard) */}
        {/* Tự động chiếm hết khoảng trống còn lại (flex-1) */}
        <div className="flex-1 transition-all duration-300 min-w-0">
          {/* Nút mở lại Sidebar (nổi) khi đang đóng - Tùy chọn UX */}
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
            onMarkLearned={handleMarkAsLearned}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
