import { useState, useEffect, useCallback } from "react";
import { AddReport, VocabularyItem } from "@/types";
import { isToday } from "@/utils";
import { GUEST_INFO } from "@/constants";

export const useGuestVocabulary = () => {
  const [allWords, setAllWords] = useState<VocabularyItem[]>([]);
  const [displayCards, setDisplayCards] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);

  // --- HELPER ---
  const saveToLocal = (data: VocabularyItem[]) => {
    localStorage.setItem(GUEST_INFO.storageKey.vocabulary, JSON.stringify(data));
    setAllWords(data);
  };

  const getFromLocal = (): VocabularyItem[] => {
    try {
      const raw = localStorage.getItem(GUEST_INFO.storageKey.vocabulary);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  // --- 1. FETCH ---
  const fetchAllWords = useCallback(async (options?: { keepFlashcards?: boolean }) => {
    setLoading(true);
    // Giả lập độ trễ nhỏ để UI không bị giật cục
    await new Promise((resolve) => setTimeout(resolve, 300));

    const localData = getFromLocal().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    setAllWords(localData);

    if (!options?.keepFlashcards) {
      setDisplayCards(localData.filter((w) => isToday(w.createdAt) && !w.isLearned));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllWords();
  }, [fetchAllWords]);

  // --- 2. ADD ---
  const addVocabulary = async (newEntries: Partial<VocabularyItem>[]): Promise<AddReport> => {
    const currentData = getFromLocal();
    const existingSet = new Set(currentData.map((w) => w.normalized));
    
    const addedWords: string[] = [];
    const skippedWords: string[] = [];
    const entriesToAdd: VocabularyItem[] = [];

    newEntries.forEach((entry) => {
      if (existingSet.has(entry.normalized!)) {
        skippedWords.push(entry.text!);
      } else {
        const now = Date.now();
        entriesToAdd.push({
          id: crypto.randomUUID(), // Tạo ID giả
          text: entry.text!,
          meaning: entry.meaning!,
          normalized: entry.normalized!,
          userId: "guest",
          createdAt: now,
          updatedAt: now,
          isLearned: false,
        });
        addedWords.push(entry.text!);
      }
    });

    if (entriesToAdd.length > 0) {
      const newData = [...entriesToAdd, ...currentData];
      saveToLocal(newData);
      // Cập nhật lại display cards nếu cần (thường add xong chưa học ngay, tùy logic cũ)
    }

    return { added: addedWords, skipped: skippedWords };
  };

  // --- 3. UPDATE ---
  const updateWord = async (id: string, updates: Partial<VocabularyItem>) => {
    const currentData = getFromLocal();
    const newData = currentData.map(w => w.id === id ? { ...w, ...updates } : w);
    
    saveToLocal(newData);
    // Update state hiển thị
    setDisplayCards(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  // --- 4. DELETE ---
  const deleteWord = async (id: string) => {
    const currentData = getFromLocal();
    const newData = currentData.filter(w => w.id !== id);
    
    saveToLocal(newData);
    setDisplayCards(prev => prev.filter(w => w.id !== id));
  };

  const bulkDeleteWords = async (ids: string[]) => {
    const currentData = getFromLocal();
    const newData = currentData.filter(w => !ids.includes(w.id));
    
    saveToLocal(newData);
    setDisplayCards(prev => prev.filter(w => !ids.includes(w.id)));
  };

  // --- 5. LOGIC ACTIONS (Copy y nguyên logic cũ) ---
  const toggleLearnedStatus = async (id: string, currentStatus: boolean) => {
    await updateWord(id, { isLearned: !currentStatus });
    if (!currentStatus === true) { // Nếu chuyển thành đã học
        setDisplayCards(prev => prev.filter(w => w.id !== id));
    }
  };

  const markAsLearned = async (id: string) => {
    await updateWord(id, { isLearned: true });
    setDisplayCards(prev => prev.filter(w => w.id !== id));
  };

  const bulkMarkLearned = async (ids: string[], status: boolean) => {
    const currentData = getFromLocal();
    const newData = currentData.map(w => ids.includes(w.id) ? { ...w, isLearned: status } : w);
    saveToLocal(newData);
    
    if (status === true) {
      setDisplayCards(prev => prev.filter(w => !ids.includes(w.id)));
    } else {
        // Nếu unlearn thì có thể cần hiện lại, logic này tùy bạn handle ở fetch
        setAllWords(newData);
    }
  };

  const bulkUpdateWords = async (ids: string[], updates: Partial<VocabularyItem>) => {
     const currentData = getFromLocal();
     const newData = currentData.map(w => ids.includes(w.id) ? { ...w, ...updates } : w);
     saveToLocal(newData);
     setDisplayCards(prev => prev.map(w => ids.includes(w.id) ? { ...w, ...updates } : w));
  };

  // Local State Actions (UI only)
  const addToPractice = (word: VocabularyItem) => {
    const exists = displayCards.find((w) => w.id === word.id);
    if (!exists) {
      setDisplayCards((prev) => [{ ...word, isLearned: false }, ...prev]);
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

  return {
    allWords,
    displayCards,
    setDisplayCards,
    loading,
    fetchAllWords,
    addVocabulary,
    updateWord,
    deleteWord,
    bulkDeleteWords,
    toggleLearnedStatus,
    bulkMarkLearned,
    markAsLearned,
    addToPractice,
    removeFromPractice,
    bulkAddToPractice,
    bulkUpdateWords
  };
};