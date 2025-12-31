// hooks/useDictionary.ts
import { WordData } from "@/types";
import { normalizeWordData } from "@/utils/dictionaryHelper";
import { useCallback, useState } from "react";

// [Quan trọng] Global Cache: Lưu trữ kết quả đã fetch
// Key: từ vựng (lowercase), Value: WordData
const GLOBAL_CACHE: Record<string, WordData | null> = {};

export const useDictionary = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Hàm chính: Nhận vào mảng từ, trả về Map kết quả
  const lookupWords = useCallback(
    async (words: string[]): Promise<WordData[]> => {
      if (!words || words.length === 0) return [];

      setLoading(true);
      setErrors([]);
      const results: WordData[] = [];
      const wordsToFetch: string[] = [];

      // 1. Kiểm tra Cache trước
      words.forEach((word) => {
        const cleanWord = word.trim().toLowerCase();
        if (GLOBAL_CACHE[cleanWord] !== undefined) {
          // Nếu đã có trong cache (dù là null - tức là tìm không thấy) cũng lấy ra
          if (GLOBAL_CACHE[cleanWord]) {
            results.push(GLOBAL_CACHE[cleanWord]!);
          }
        } else {
          // Nếu chưa có trong cache thì đưa vào danh sách cần fetch
          wordsToFetch.push(cleanWord);
        }
      });

      // Nếu tất cả đều có trong cache rồi thì trả về luôn
      if (wordsToFetch.length === 0) {
        setLoading(false);
        return results;
      }

      // 2. Fetch song song các từ chưa có (Promise.allSettled để 1 cái lỗi không làm chết cả đám)
      const fetchPromises = wordsToFetch.map(async (word) => {
        try {
          const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );

          if (!response.ok) {
            // Nếu 404 (không tìm thấy), ta vẫn lưu vào cache là null để lần sau không fetch lại nữa
            GLOBAL_CACHE[word] = null;
            return null;
          }

          const rawData = await response.json();
          const cleanData = normalizeWordData(rawData); // Mapping qua Helper

          // Lưu vào Cache
          GLOBAL_CACHE[word] = cleanData;
          return cleanData;
        } catch (err) {
          console.error(`Error fetching ${word}:`, err);
          return null;
        }
      });

      await Promise.all(fetchPromises);

      // 3. Tổng hợp lại kết quả (Lấy lại từ Cache vì vừa update xong)
      const finalResults = words
        .map((w) => GLOBAL_CACHE[w.trim().toLowerCase()])
        .filter(Boolean) as WordData[];

      setLoading(false);
      return finalResults;
    },
    []
  );

  // Hàm tiện ích để clear cache thủ công nếu cần
  const clearCache = () => {
    for (const key in GLOBAL_CACHE) delete GLOBAL_CACHE[key];
  };

  return {
    lookupWords,
    loading,
    errors,
    cache: GLOBAL_CACHE,
    clearCache,
  };
};
