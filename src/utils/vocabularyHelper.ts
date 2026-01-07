import { PartOfSpeech, PhoneticItem, VocabularyItem, WordData } from "@/types";
import moment from "moment";

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

export const getShortPartOfSpeech = (pos) => {
  const mapping = {
    [PartOfSpeech.NOUN]: "n",
    [PartOfSpeech.VERB]: "v",
    [PartOfSpeech.ADJECTIVE]: "adj",
    [PartOfSpeech.ADVERB]: "adv",
    [PartOfSpeech.PRONOUN]: "pron",
    [PartOfSpeech.PREPOSITION]: "prep",
    [PartOfSpeech.CONJUNCTION]: "conj",
    [PartOfSpeech.INTERJECTION]: "int",
    [PartOfSpeech.PHRASAL_VERB]: "phr v",
    [PartOfSpeech.IDIOM]: "idm",
    [PartOfSpeech.OTHER]: "etc",
  };
  return mapping[pos] || pos || "";
};

export const getPartOfSpeechStyle = (pos: PartOfSpeech | string): string => {
  const styles: Record<string, string> = {
    // Noun: Xanh dương năng động
    [PartOfSpeech.NOUN]:
      "bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800",

    // Verb: Đỏ hồng rực rỡ
    [PartOfSpeech.VERB]:
      "bg-rose-500/10 text-rose-600 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-800",

    // Adjective: Xanh lá mạ tươi mát
    [PartOfSpeech.ADJECTIVE]:
      "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-800",

    // Adverb: Vàng cam rực rỡ
    [PartOfSpeech.ADVERB]:
      "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-800",

    // Pronoun: Tím mộng mơ
    [PartOfSpeech.PRONOUN]:
      "bg-violet-500/10 text-violet-600 border-violet-200 dark:bg-violet-500/20 dark:text-violet-400 dark:border-violet-800",

    // Preposition: Xanh lơ (Cyan)
    [PartOfSpeech.PREPOSITION]:
      "bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-800",

    // Conjunction: Cam neon
    [PartOfSpeech.CONJUNCTION]:
      "bg-orange-500/10 text-orange-600 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-800",

    // Phrasal Verb: Tím Indigo
    [PartOfSpeech.PHRASAL_VERB]:
      "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-800",

    // Idiom: Hồng Fuchsia
    [PartOfSpeech.IDIOM]:
      "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-200 dark:bg-fuchsia-500/20 dark:text-fuchsia-400 dark:border-fuchsia-800",
  };

  return (
    styles[pos] ||
    "bg-slate-500/10 text-slate-600 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-800"
  );
};

export const formatDateGroup = (dateString: string) => {
  const date = moment(dateString);
  if (!date.isValid()) return "Date unknown";
  const now = moment();
  if (date.isSame(now, "day")) return "Today";
  if (date.isSame(now.clone().subtract(1, "days"), "day")) return "Yesterday";
  const formatted = date.format("dddd, DD/MM/YYYY");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};
