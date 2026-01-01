import { FirebaseVocabularyService } from "@/services/vocabulary/firebase.adapter";
import { GuestVocabularyService } from "@/services/vocabulary/guest.adapter";
import { IVocabularyService } from "@/services/vocabulary/types";
import { AddReport, BatchUpdateVocabularyItem, VocabularyItem } from "@/types";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";

export const useVocabulary = () => {
  const { userProfile } = useAuth();
  const [allWords, setAllWords] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const service: IVocabularyService = useMemo(() => {
    return userProfile?.id
      ? new FirebaseVocabularyService(userProfile?.id)
      : new GuestVocabularyService();
  }, [userProfile]);

  // --- DATA FETCHING ---
  const fetchAllWords = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedWords = await service.fetchAll();
      setAllWords(fetchedWords);
    } catch (error) {
      console.error("Fetch failed", error);
      toast.error("Failed to load vocabulary");
    } finally {
      setLoading(false);
    }
  }, [service]);

  const addVocabulary = async (
    newEntries: Partial<VocabularyItem>[]
  ): Promise<AddReport> => {
    try {
      const report = await service.add(newEntries, allWords);
      // Refresh lại data sau khi thêm
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
    // Optimistic Update
    setAllWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );

    try {
      await service.update(id, updates);
      toast.success("Updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Update failed!");
      fetchAllWords(); // Revert
    }
  };

  const deleteWord = async (id: string) => {
    setAllWords((prev) => prev.filter((w) => w.id !== id));
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
    setAllWords((prev) =>
      prev.map((w) => (ids.includes(w.id) ? { ...w, ...updates } : w))
    );

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
    setAllWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isLearned: newStatus } : w))
    );

    try {
      await service.update(id, { isLearned: newStatus });
      toast.success("Updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Update failed!");
    }
  };

  const markAsLearned = async (id: string, isLearned: boolean) => {
    setAllWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isLearned } : w))
    );

    try {
      await service.update(id, { isLearned: true });
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

    try {
      await service.bulkUpdate(ids, { isLearned: status });
      toast.success("Updated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Update failed");
    }
  };

  const batchUpdateWords = async (items: BatchUpdateVocabularyItem[]) => {
    setAllWords((prev) => {
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

      // 3. Phân tích kết quả
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successCount++;
        } else {
          // Lấy ID của item bị lỗi dựa vào index (vì Promise.allSettled giữ đúng thứ tự)
          const itemId = items[index].id;
          failedItems.push({ id: itemId, reason: result.reason });

          // Log lỗi chi tiết ra console
          console.error(`Batch update failed for ID ${itemId}:`, result.reason);
        }
      });

      // 4. Hiển thị thông báo (Toast)
      const total = items.length;

      if (failedItems.length === 0) {
        // Case 1: Thành công toàn bộ
        toast.success(`Updated all ${total} words successfully!`);
      } else if (successCount === 0) {
        // Case 2: Thất bại toàn bộ
        toast.error(`Failed to update all ${total} words. Please try again.`);
        // Reload lại dữ liệu thật từ server để revert optimistic update
        void fetchAllWords();
      } else {
        // Case 3: Thành công 1 phần (Warning)
        toast.warning(
          `Updated ${successCount}/${total} words. ${failedItems.length} failed.`
        );
        // Reload lại dữ liệu để những item bị fail hiển thị lại đúng trạng thái cũ
        void fetchAllWords();
      }
    } catch (error) {
      // Lỗi hệ thống nghiêm trọng (rất hiếm khi xảy ra với allSettled trừ khi code crash)
      console.error("Critical batch update error:", error);
      toast.error("Batch update encountered a critical error.");
      void fetchAllWords();
    }
  };

  return {
    allWords,
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
    batchUpdateWords,
  };
};
