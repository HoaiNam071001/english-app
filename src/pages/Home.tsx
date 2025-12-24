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
