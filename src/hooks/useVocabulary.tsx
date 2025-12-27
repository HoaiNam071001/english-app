// hooks/useVocabulary.ts
import { FirebaseVocabularyService } from "@/services/vocabulary/firebase.adapter";
import { GuestVocabularyService } from "@/services/vocabulary/guest.adapter";
import { IVocabularyService } from "@/services/vocabulary/types";
import { AddReport, VocabularyItem } from "@/types";
import { isToday } from "@/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";

export const useVocabulary = () => {
  const { userProfile } = useAuth();
  const [allWords, setAllWords] = useState<VocabularyItem[]>([]);
  const [displayCards, setDisplayCards] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const service: IVocabularyService = useMemo(() => {
    return userProfile?.id
      ? new FirebaseVocabularyService(userProfile?.id)
      : new GuestVocabularyService();
  }, [userProfile]);

  // --- DATA FETCHING ---
  const fetchAllWords = useCallback(
    async (options?: { keepFlashcards?: boolean }) => {
      setLoading(true);
      try {
        const fetchedWords = await service.fetchAll();
        setAllWords(fetchedWords);

        if (!options?.keepFlashcards) {
          setDisplayCards(
            fetchedWords.filter((w) => isToday(w.createdAt) && !w.isLearned)
          );
        }
      } catch (error) {
        console.error("Fetch failed", error);
        toast.error("Failed to load vocabulary");
      } finally {
        setLoading(false);
      }
    },
    [service, toast]
  );

  useEffect(() => {
    fetchAllWords();
  }, []);

  const addVocabulary = async (
    newEntries: Partial<VocabularyItem>[]
  ): Promise<AddReport> => {
    try {
      const report = await service.add(newEntries, allWords);

      // Refresh lại data sau khi thêm để đảm bảo đồng bộ ID/Timestamp
      await fetchAllWords({ keepFlashcards: true });

      if (report.added.length > 0) {
        toast.success(`${report.added.length} new words added`);
      }
      return report;
    } catch (e) {
      console.error(e);
      toast.error("Failed to add words!");
      return { added: [], skipped: [] };
    }
  };

  const updateWord = async (id: string, updates: Partial<VocabularyItem>) => {
    const applyUpdate = (prev: VocabularyItem[]) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w));

    setAllWords(applyUpdate);
    setDisplayCards(applyUpdate);

    try {
      await service.update(id, updates);
      toast.success("Updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Update failed!");
      // Revert if needed (đơn giản nhất là fetch lại)
      fetchAllWords({ keepFlashcards: true });
    }
  };

  const deleteWord = async (id: string) => {
    setAllWords((prev) => prev.filter((w) => w.id !== id));
    setDisplayCards((prev) => prev.filter((w) => w.id !== id));
    try {
      await service.delete(id);
      toast.success("Deleted successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Delete failed!");
    }
  };

  const bulkDeleteWords = async (ids: string[]) => {
    setAllWords((prev) => prev.filter((w) => !ids.includes(w.id)));
    setDisplayCards((prev) => prev.filter((w) => !ids.includes(w.id)));
    try {
      await service.bulkDelete(ids);
      toast.success("Deleted successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Delete failed!");
    }
  };

  const bulkUpdateWords = async (
    ids: string[],
    updates: Partial<VocabularyItem>
  ) => {
    const applyUpdate = (prev: VocabularyItem[]) =>
      prev.map((w) => (ids.includes(w.id) ? { ...w, ...updates } : w));

    setAllWords(applyUpdate);
    setDisplayCards(applyUpdate);

    try {
      await service.bulkUpdate(ids, updates);
      toast.success("Updated successfully!");
    } catch (error) {
      console.error("Bulk update error:", error);
      toast.error("Update failed!");
    }
  };

  const toggleLearnedStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Update local UI logic specifically for "learned"
    setAllWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isLearned: newStatus } : w))
    );
    if (newStatus === true) {
      setDisplayCards((prev) => prev.filter((w) => w.id !== id));
    }

    try {
      await service.update(id, { isLearned: newStatus });
      toast.success("Updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Update failed!");
    }
  };

  const markAsLearned = async (id: string, isLearned: boolean) => {
    // Logic riêng cho Flashcard
    setAllWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isLearned } : w))
    );
    setDisplayCards((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isLearned } : w))
    );

    try {
      await service.update(id, { isLearned: true }); // Luôn save true theo logic cũ
      toast.success("Updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    }
  };

  const bulkMarkLearned = async (ids: string[], status: boolean) => {
    setAllWords((prev) =>
      prev.map((w) => (ids.includes(w.id) ? { ...w, isLearned: status } : w))
    );
    if (status === true) {
      setDisplayCards((prev) => prev.filter((w) => !ids.includes(w.id)));
    }

    try {
      await service.bulkUpdate(ids, { isLearned: status });
      toast.success("Updated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Update failed");
    }
  };

  // --- LOCAL ONLY ACTIONS (Không gọi Service) ---
  const addToPractice = (word: VocabularyItem) => {
    const exists = displayCards.find((w) => w.id === word.id);
    if (!exists) {
      setDisplayCards((prev) => [word, ...prev]);
    }
  };

  const removeFromPractice = (word: VocabularyItem) => {
    setDisplayCards((prev) => prev.filter((w) => w.id !== word.id));
  };

  const bulkAddToPractice = (words: VocabularyItem[]) => {
    setDisplayCards((prev) => {
      const existingIds = new Set(prev.map((w) => w.id));
      const newWords = words.filter((w) => !existingIds.has(w.id));
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
    bulkUpdateWords,
    addToPractice,
    removeFromPractice,
    bulkAddToPractice,
  };
};
