import { db } from "@/firebaseConfig";
import { AddReport, DataTable, VocabularyItem } from "@/types";
import { isToday } from "@/utils";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

export const useVocabulary = (userId: string | null) => {
  const [allWords, setAllWords] = useState<VocabularyItem[]>([]);
  const [displayCards, setDisplayCards] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const addVocabulary = async (
    newEntries: Partial<VocabularyItem>[]
  ): Promise<AddReport> => {
    if (!userId) return { added: [], skipped: [] };

    // Check trùng dựa trên state hiện tại
    const existingSet = new Set(allWords.map((w) => w.normalized));
    const currentBatchSet = new Set<string>();

    const batch = writeBatch(db);
    const addedWords: string[] = [];
    const skippedWords: string[] = [];

    newEntries.forEach((entry) => {
      if (
        existingSet.has(entry.normalized!) ||
        currentBatchSet.has(entry.normalized!)
      ) {
        skippedWords.push(entry.text!);
      } else {
        const newDocRef = doc(collection(db, DataTable.Vocabulary));
        const docData = {
          text: entry.text,
          meaning: entry.meaning,
          normalized: entry.normalized,
          userId: userId, // <--- SỬ DỤNG USER ID
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isLearned: false,
        };
        batch.set(newDocRef, docData);

        currentBatchSet.add(entry.normalized!);
        addedWords.push(entry.text!);
      }
    });

    if (addedWords.length > 0) {
      try {
        await batch.commit();
      } catch (e) {
        console.error("Error adding batch:", e);
      }
    }

    return { added: addedWords, skipped: skippedWords };
  };

  // 1. FETCH DATA
  const fetchAllWords = useCallback(
    async (options?: { keepFlashcards?: boolean }) => {
      if (!userId) {
        setAllWords([]);
        setDisplayCards([]);
        return;
      }

      setLoading(true);
      try {
        const q = query(
          collection(db, DataTable.Vocabulary),
          where("userId", "==", userId),
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

        if (!options?.keepFlashcards) {
          setDisplayCards(
            fetchedWords?.filter((w) => isToday(w.createdAt) && !w.isLearned)
          );
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Tự động fetch khi userId thay đổi
  useEffect(() => {
    fetchAllWords();
  }, [fetchAllWords]);

  // ... (Các hàm updateWord, deleteWord, toggleLearnedStatus ... giữ nguyên logic cũ vì chúng dùng Doc ID, không ảnh hưởng bởi field userId)

  const updateWord = async (id: string, updates: Partial<VocabularyItem>) => {
    // ... Code cũ giữ nguyên
    setAllWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
    setDisplayCards((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
    try {
      await updateDoc(doc(db, DataTable.Vocabulary, id), updates);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteWord = async (id: string) => {
    // ... Code cũ giữ nguyên
    setAllWords((prev) => prev.filter((w) => w.id !== id));
    setDisplayCards((prev) => prev.filter((w) => w.id !== id));
    try {
      await deleteDoc(doc(db, DataTable.Vocabulary, id));
    } catch (e) {
      console.error(e);
    }
  };

  const bulkDeleteWords = async (ids: string[]) => {
    // ... Code cũ giữ nguyên
    setAllWords((prev) => prev.filter((w) => !ids.includes(w.id)));
    setDisplayCards((prev) => prev.filter((w) => !ids.includes(w.id)));
    try {
      const batch = writeBatch(db);
      ids.forEach((id) => batch.delete(doc(db, DataTable.Vocabulary, id)));
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  // Tự động fetch khi email thay đổi
  useEffect(() => {
    fetchAllWords();
  }, [fetchAllWords]);

  // 5. TOGGLE LEARNED STATUS (Sidebar Action)
  const toggleLearnedStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    setAllWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isLearned: newStatus } : w))
    );

    if (newStatus === true) {
      setDisplayCards((prev) => prev.filter((w) => w.id !== id));
    }

    try {
      await updateDoc(doc(db, DataTable.Vocabulary, id), {
        isLearned: newStatus,
      });
    } catch (error) {
      console.error("Lỗi update status:", error);
    }
  };

  // 6. BULK MARK LEARNED
  const bulkMarkLearned = async (ids: string[], status: boolean) => {
    setAllWords((prev) =>
      prev.map((w) => (ids.includes(w.id) ? { ...w, isLearned: status } : w))
    );

    if (status === true) {
      setDisplayCards((prev) => prev.filter((w) => !ids.includes(w.id)));
    }

    try {
      const batch = writeBatch(db);
      ids.forEach((id) => {
        const docRef = doc(db, DataTable.Vocabulary, id);
        batch.update(docRef, { isLearned: status });
      });
      await batch.commit();
    } catch (error) {
      console.error("Lỗi bulk update:", error);
    }
  };

  // 7. FLASHCARD SPECIFIC ACTION: Mark As Learned
  const markAsLearned = async (id: string) => {
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

  // 8. LOCAL STATE ACTIONS (Không gọi API)
  const addToPractice = (word: VocabularyItem) => {
    const exists = displayCards.find((w) => w.id === word.id);
    if (!exists) {
      const wordToPractice = { ...word, isLearned: false };
      setDisplayCards((prev) => [wordToPractice, ...prev]);
    }
  };

  const removeFromPractice = (word: VocabularyItem) => {
    setDisplayCards((prev) => prev.filter((w) => w.id !== word.id));
  };

  const bulkAddToPractice = (words: VocabularyItem[]) => {
    setDisplayCards((prev) => {
      const existingIds = new Set(prev.map((w) => w.id));
      const newWords = words
        .filter((w) => !existingIds.has(w.id))
        .map((w) => ({ ...w, isLearned: false }));
      return [...newWords, ...prev];
    });
  };

  // 10. BULK UPDATE (General Purpose)
  const bulkUpdateWords = async (
    ids: string[],
    updates: Partial<VocabularyItem>
  ) => {
    // Optimistic UI Update
    setAllWords((prev) =>
      prev.map((w) => (ids.includes(w.id) ? { ...w, ...updates } : w))
    );

    // Update DisplayCards nếu cần (ví dụ nếu đổi topic mà đang filter topic thì có thể cần remove, nhưng ở đây ta cứ update data thôi)
    setDisplayCards((prev) =>
      prev.map((w) => (ids.includes(w.id) ? { ...w, ...updates } : w))
    );

    // Update Firestore (Batch)
    try {
      const batch = writeBatch(db);
      ids.forEach((id) => {
        const docRef = doc(db, DataTable.Vocabulary, id);
        batch.update(docRef, updates);
      });
      await batch.commit();
    } catch (error) {
      console.error("Lỗi bulk update:", error);
    }
  };

  return {
    // Data State
    allWords,
    displayCards,
    setDisplayCards, // Expose để FlashcardSection có thể shuffle/clear
    loading,

    // Actions
    fetchAllWords, // Dùng để refresh khi Create Modal thành công
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
  };
};
