import { PhoneticItem, VocabularyItem, WordData } from "@/types";

// Hàm chính: Convert dữ liệu API sang Model lưu DB
export const mapApiToVocabularyItem = (
  currentInput: Partial<VocabularyItem>,
  apiData: WordData
): Partial<VocabularyItem> => {
  // 1. Xử lý POS: Map sang enum ngắn -> Xóa trùng
  const posList = apiData.meanings.map((m) => m.partOfSpeech);
  const uniquePos = [...new Set(posList)];

  // 2. Xử lý Phonetics Array
  const rawPhonetics = apiData.phonetics || [];
  const processedPhonetics: PhoneticItem[] = [];
  const seenTexts = new Set<string>(); // Để check trùng text IPA

  rawPhonetics.forEach((p) => {
    // Chỉ lấy nếu có text. Audio có hay không kệ.
    if (p.text && p.text.trim() !== "") {
      const key = `${p.text}-${p.audio || ""}`; // Key check trùng cả cặp text+audio

      if (!seenTexts.has(key)) {
        processedPhonetics.push({
          text: p.text,
          audio: p.audio || null,
          accent: p.accent || null,
        });
        seenTexts.add(key);
      }
    }
  });

  // 3. Lấy Example
  const firstExample = apiData.meanings
    .flatMap((m) => m.definitions)
    .map((d) => d.example)
    .filter((e) => e)
    .join("\n");

  return {
    ...currentInput,

    // Data mới
    phonetics: processedPhonetics,
    partOfSpeech: uniquePos,

    // Example
    example: currentInput.example || firstExample || "",
  };
};
