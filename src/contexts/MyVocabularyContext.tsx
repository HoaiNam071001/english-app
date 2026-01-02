import { VocabularyItem } from "@/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

// Kiểu dữ liệu cho Cache: Key là UserId, Value là danh sách từ
type VocabularyCache = Record<string, VocabularyItem[]>;

interface MyVocabularyContextType {
  isLoadedByUser: (userId: string) => boolean;
  // Lấy dữ liệu từ cache theo userId
  getCachedWords: (userId: string) => VocabularyItem[];
  // Lưu dữ liệu vào cache
  cacheWords: (userId: string, words: VocabularyItem[]) => void;
  // Xóa cache (nếu cần, ví dụ khi logout hoàn toàn mà muốn clear RAM)
  clearCache: (userId: string) => void;
}

const MyVocabularyContext = createContext<MyVocabularyContextType | undefined>(
  undefined
);

export const MyVocabularyProvider = ({ children }: { children: ReactNode }) => {
  const [cache, setCache] = useState<VocabularyCache>({});

  const getCachedWords = useCallback(
    (userId: string) => {
      return cache[userId] || [];
    },
    [cache]
  );

  const isLoadedByUser = useCallback(
    (userId: string) => {
      return !!cache[userId];
    },
    [cache]
  );

  const cacheWords = useCallback((userId: string, words: VocabularyItem[]) => {
    setCache((prev) => ({
      ...prev,
      [userId]: words,
    }));
  }, []);

  const clearCache = useCallback((userId: string) => {
    setCache((prev) => {
      const newCache = { ...prev };
      delete newCache[userId];
      return newCache;
    });
  }, []);

  return (
    <MyVocabularyContext.Provider
      value={{ getCachedWords, cacheWords, clearCache, isLoadedByUser }}
    >
      {children}
    </MyVocabularyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useVocabularyContext = () => {
  const context = useContext(MyVocabularyContext);
  if (!context) {
    throw new Error(
      "useVocabularyContext must be used within a MyVocabularyProvider"
    );
  }
  return context;
};
