import { FirebaseVocabularyService } from "@/services/vocabulary/firebase.adapter";
import { VocabularyItem } from "@/types";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";

export const useSharedVocabulary = () => {
  const { userProfile } = useAuth();
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const toast = useToast();

  const service = useMemo(() => {
    return new FirebaseVocabularyService(userProfile?.id);
  }, [userProfile?.id]);

  /**
   * Tải trang tiếp theo
   * @param pageSize Số lượng item mỗi lần load
   * @param isRefresh Nếu true (keyword đổi/refresh), xóa data cũ và load từ đầu
   * @param keyword Từ khóa tìm kiếm
   */
  const fetchNextSharedPage = useCallback(
    async (pageSize: number, isRefresh = false, keyword = "") => {
      // Nếu đang load thì không làm gì cả
      if (loading) return;
      // Nếu không phải refresh và đã hết dữ liệu thì dừng
      if (!isRefresh && !hasMore) return;

      setLoading(true);

      try {
        // Nếu refresh, chúng ta bắt đầu từ null (trang đầu tiên)
        const currentLastDoc = isRefresh ? null : lastDoc;

        const result = await service.fetchSharedPage(
          pageSize,
          currentLastDoc,
          keyword
        );

        if (isRefresh) {
          // RESET PAGE: Thay thế toàn bộ bằng dữ liệu mới
          setItems(result.data);
          setHasMore(result.data.length === pageSize);
        } else {
          // APPEND: Nối tiếp vào danh sách hiện tại
          setItems((prev) => [...prev, ...result.data]);
          setHasMore(result.data.length === pageSize);
        }

        setLastDoc(result.lastVisible);
        setTotalCount(result.total);
      } catch (error) {
        console.error("Fetch shared vocabulary failed:", error);
        toast.error("Không thể tải dữ liệu chia sẻ");
      } finally {
        setLoading(false);
      }
    },
    [service, lastDoc, loading, hasMore, toast]
  );

  // Hàm refresh tiện ích (thường dùng cho pull-to-refresh)
  const refresh = useCallback(
    (pageSize = 10, keyword = "") => {
      return fetchNextSharedPage(pageSize, true, keyword);
    },
    [fetchNextSharedPage]
  );

  return {
    items,
    loading,
    totalCount,
    hasMore,
    fetchNextSharedPage,
    refresh,
  };
};
