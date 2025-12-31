// utils/dictionaryHelper.ts

import {
  AccentType,
  Definition,
  DictionaryEntry,
  Meaning,
  MeaningData,
  Phonetic,
  PhoneticData,
  WordData,
} from "@/types";

// Logic detect giọng dựa vào tên file (API này thường trả về link chứa -us.mp3, -uk.mp3)
const detectAccent = (audioUrl: string): AccentType => {
  if (audioUrl.includes("-us.mp3")) return AccentType.US;
  if (audioUrl.includes("-uk.mp3") || audioUrl.includes("-gb.mp3"))
    return AccentType.UK;
  if (audioUrl.includes("-au.mp3")) return AccentType.AU;
  return AccentType.US;
};

export const normalizeWordData = (
  apiResult: DictionaryEntry[]
): WordData | null => {
  if (!apiResult || apiResult.length === 0) return null;

  const entry = apiResult[0];

  // 1. Xử lý Phonetics (Lọc trùng và detect accent)
  const processedPhonetics: PhoneticData[] = [];

  // Duyệt qua mảng phonetics
  if (entry.phonetics) {
    entry.phonetics.forEach((p: Phonetic) => {
      if (!p.text || !p.audio) return; // Bỏ qua cái rỗng

      const accent = detectAccent(p.audio);

      // Check xem đã có phonetic text này với accent này chưa để tránh trùng
      const exists = processedPhonetics.find((x) => x.text === p.text);
      if (!exists) {
        processedPhonetics.push({
          text: p.text || entry.phonetic || "",
          audio: p.audio || null,
          accent: accent,
        });
      }
    });
  }
  if (entry.phonetic && !processedPhonetics?.length) {
    processedPhonetics.push({ text: entry.phonetic, accent: AccentType.US });
  }

  // 2. Xử lý Meanings
  const processedMeanings: MeaningData[] = entry.meanings.map((m: Meaning) => ({
    partOfSpeech: m.partOfSpeech,
    definitions: m.definitions.map((d: Definition) => ({
      definition: d.definition || null,
      example: d.example || null, // Lấy ví dụ nếu có
    })),
  }));

  return {
    word: entry.word,
    phonetics: processedPhonetics, // Mảng chứa cả US, UK, text...
    meanings: processedMeanings,
  };
};
