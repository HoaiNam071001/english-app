import { GUEST_INFO } from "@/constants"; // Import constant Guest ID
import { useVocabularyContext } from "@/contexts/MyVocabularyContext";
import { FirebaseVocabularyService } from "@/services/vocabulary/firebase.adapter";
import { GuestVocabularyService } from "@/services/vocabulary/guest.adapter";
import { IVocabularyService } from "@/services/vocabulary/types";
import { AddReport, BatchUpdateVocabularyItem, VocabularyItem } from "@/types";
import {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";

export const useVocabulary = () => {
  const { userProfile } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const { getCachedWords, cacheWords, isLoadedByUser } = useVocabularyContext();
  const toast = useToast();

  // Xác định ID hiện tại (User thật hoặc Guest)
  const currentUserId = useMemo(() => {
    return userProfile?.id || GUEST_INFO.id;
  }, [userProfile?.id]);

  // Khởi tạo state từ Context Cache ngay lập tức
  const [allWords, setAllWords] = useState<VocabularyItem[]>(() => {
    return getCachedWords(currentUserId);
  });

  const [loading, setLoading] = useState(false);

  // Service Factory
  const service: IVocabularyService = useMemo(() => {
    return userProfile?.id
      ? new FirebaseVocabularyService(userProfile?.id)
      : new GuestVocabularyService();
  }, [userProfile]);

  useEffect(() => {
    setIsLoaded(isLoadedByUser(currentUserId));
  }, [currentUserId, isLoadedByUser]);

  // Effect: Khi chuyển đổi User (VD: Login/Logout), cập nhật lại state từ Cache của User mới
  useEffect(() => {
    const cachedData = getCachedWords(currentUserId);
    setAllWords(cachedData);
  }, [currentUserId, getCachedWords]);

  const onSetAllWords = (value: SetStateAction<VocabularyItem[]>) => {
    if (typeof value === "function") {
      setAllWords((prev) => {
        const newState = value(prev);
        cacheWords(currentUserId, newState);
        return newState;
      });
    } else {
      setAllWords(value);
      cacheWords(currentUserId, value);
    }
  };

  // --- DATA FETCHING ---
  const fetchAllWords = useCallback(
    async (force = true) => {
      if (isLoadedByUser(currentUserId) && !force) return;
      console.log("Fetching all words...");
      setLoading(true);
      try {
        const fetchedWords = await service.fetchAll();

        onSetAllWords(fetchedWords);
      } catch (error) {
        console.error("Fetch failed", error);
        toast.error("Failed to load vocabulary");
      } finally {
        setLoading(false);
      }
    },
    [service, currentUserId, toast, isLoaded]
  );

  const addVocabulary = async (
    newEntries: Partial<VocabularyItem>[]
  ): Promise<AddReport> => {
    try {
      const report = await service.add(newEntries, allWords);
      // Refresh lại data sau khi thêm (sẽ trigger cập nhật cache trong fetchAllWords)
      await fetchAllWords();

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
    // Optimistic Update (UI Only)
    onSetAllWords((prev) => {
      const newState = prev.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      );
      return newState;
    });

    try {
      await service.update(id, updates);
      toast.success("Updated successfully!");
      // Lưu ý: Nếu muốn cache luôn đúng 100%, bạn có thể gọi fetchAllWords() ở đây,
      // nhưng để tối ưu performance, ta thường chấp nhận Optimistic UI và chỉ sync khi cần thiết.
    } catch (error) {
      console.error(error);
      toast.error("Update failed!");
      fetchAllWords(); // Revert & Re-sync cache nếu lỗi
    }
  };

  const deleteWord = async (id: string) => {
    onSetAllWords((prev) => prev.filter((w) => w.id !== id));
    try {
      await service.delete(id);
      toast.success("Deleted successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Delete failed!");
      fetchAllWords(); // Revert
    }
  };

  const bulkDeleteWords = async (ids: string[]) => {
    onSetAllWords((prev) => prev.filter((w) => !ids.includes(w.id)));
    try {
      await service.bulkDelete(ids);
      toast.success("Deleted successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Delete failed!");
      fetchAllWords(); // Revert
    }
  };

  const bulkUpdateWords = async (
    ids: string[],
    updates: Partial<VocabularyItem>
  ) => {
    onSetAllWords((prev) =>
      prev.map((w) => (ids.includes(w.id) ? { ...w, ...updates } : w))
    );

    try {
      await service.bulkUpdate(ids, updates);
      toast.success("Updated successfully!");
    } catch (error) {
      console.error("Bulk update error:", error);
      toast.error("Update failed!");
      fetchAllWords(); // Revert
    }
  };

  const toggleLearnedStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    onSetAllWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isLearned: newStatus } : w))
    );

    try {
      await service.update(id, { isLearned: newStatus });
      toast.success("Updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Update failed!");
      fetchAllWords(); // Revert
    }
  };

  const markAsLearned = async (id: string, isLearned: boolean) => {
    onSetAllWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isLearned } : w))
    );

    try {
      await service.update(id, { isLearned: true });
      toast.success("Updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
      fetchAllWords(); // Revert
    }
  };

  const bulkMarkLearned = async (ids: string[], status: boolean) => {
    onSetAllWords((prev) =>
      prev.map((w) => (ids.includes(w.id) ? { ...w, isLearned: status } : w))
    );

    try {
      await service.bulkUpdate(ids, { isLearned: status });
      toast.success("Updated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Update failed");
      fetchAllWords(); // Revert
    }
  };

  const batchUpdateWords = async (items: BatchUpdateVocabularyItem[]) => {
    onSetAllWords((prev) => {
      const updatesMap = new Map(items.map((item) => [item.id, item.updates]));
      const newVal = prev.map((w) => {
        const specificUpdate = updatesMap.get(w.id);
        return specificUpdate ? { ...w, ...specificUpdate } : w;
      });
      return newVal;
    });

    try {
      const results = await Promise.allSettled(
        items.map((item) => service.update(item.id, item.updates))
      );

      let successCount = 0;
      const failedItems: { id: string; reason: unknown }[] = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successCount++;
        } else {
          const itemId = items[index].id;
          failedItems.push({ id: itemId, reason: result.reason });
          console.error(`Batch update failed for ID ${itemId}:`, result.reason);
        }
      });

      const total = items.length;

      if (failedItems.length === 0) {
        toast.success(`Updated all ${total} words successfully!`);
      } else if (successCount === 0) {
        toast.error(`Failed to update all ${total} words. Please try again.`);
        void fetchAllWords();
      } else {
        toast.warning(
          `Updated ${successCount}/${total} words. ${failedItems.length} failed.`
        );
        void fetchAllWords();
      }
    } catch (error) {
      console.error("Critical batch update error:", error);
      toast.error("Batch update encountered a critical error.");
      void fetchAllWords();
    }
  };

  return {
    allWords,
    loading,
    isLoaded,
    fetchAllWords,
    addVocabulary,
    updateWord,
    deleteWord,
    bulkDeleteWords,
    toggleLearnedStatus,
    bulkMarkLearned,
    markAsLearned,
    bulkUpdateWords,
    batchUpdateWords,
  };
};
