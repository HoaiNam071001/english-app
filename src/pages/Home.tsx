import CreateVocabularyModal from "@/components/CreateVocabularyModal";
import EmailEntry from "@/components/EmailEntry";
import FlashcardSection from "@/components/FlashcardSection";
import { Button } from "@/components/ui/button";
import VocabularySidebar from "@/components/VocabularySidebar";
import { db } from "@/firebaseConfig";
import { VocabularyItem } from "@/types";
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
} from "firebase/firestore";
import { LogOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const HomePage = () => {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [allWords, setAllWords] = useState<VocabularyItem[]>([]);
  const [displayCards, setDisplayCards] = useState<VocabularyItem[]>([]);

  // ... (Các phần code fetchAllWords, useEffect, Login giữ nguyên) ...

  const fetchAllWords = async () => {
    // ... Giữ nguyên logic cũ
    if (!currentUserEmail) return;
    try {
      const q = query(
        collection(db, "vocabulary"),
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

  // ... (useEffect, handleLogin, handleLogout giữ nguyên) ...
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

  // ... (handleMarkAsLearned, handleAddToPractice giữ nguyên) ...
  const handleMarkAsLearned = async (id: string) => {
    setAllWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isLearned: true } : w))
    );
    try {
      const docRef = doc(db, "vocabulary", id);
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
    if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn từ này?")) return;

    // A. Update UI ngay lập tức
    setAllWords((prev) => prev.filter((w) => w.id !== id));
    setDisplayCards((prev) => prev.filter((w) => w.id !== id));

    // B. Xóa trong Database
    try {
      await deleteDoc(doc(db, "vocabulary", id));
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Xóa thất bại, vui lòng thử lại");
      // Có thể fetch lại data nếu cần thiết
    }
  };

  const activeWordIds = useMemo(() => {
    return new Set(displayCards.map((w) => w.id));
  }, [displayCards]);

  if (!currentUserEmail) {
    return <EmailEntry onSubmit={handleLogin} />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Vocabulary Manager
          </h1>
          <p className="text-sm text-slate-500">User: {currentUserEmail}</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-slate-500"
        >
          <LogOut size={16} className="mr-2" /> Thoát
        </Button>
      </header>

      <div className="mb-3">
        <CreateVocabularyModal
          userEmail={currentUserEmail}
          onSuccess={fetchAllWords}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3 col-span-1">
          <VocabularySidebar
            allWords={allWords}
            activeWordIds={activeWordIds}
            onAddToPractice={handleAddToPractice}
            onDelete={handleDeleteWord} // <--- 3. Truyền hàm delete xuống
          />
        </div>

        <div className="md:col-span-9">
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
