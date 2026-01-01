import { PartOfSpeech, PhoneticItem, WordData } from "@/types";

export interface EnMeaningItem {
  partOfSpeech: string;
  definition: string;
  example?: string | null;
}

export interface ProcessedDraft {
  phonetics: PhoneticItem[];
  partOfSpeech: PartOfSpeech[]; // ['noun', 'verb', ...]
  enMeanings: EnMeaningItem[];
}
// --- HELPER: TRANSFORM API DATA ---
export const transformApiData = (entry: WordData): ProcessedDraft => {
  const enMeanings: EnMeaningItem[] = [];
  const posSet = new Set<PartOfSpeech>();

  if (entry.meanings && Array.isArray(entry.meanings)) {
    entry.meanings.forEach((m) => {
      if (m.partOfSpeech) posSet.add(m.partOfSpeech);

      if (m.definitions && Array.isArray(m.definitions)) {
        m.definitions.forEach((d) => {
          enMeanings.push({
            partOfSpeech: m.partOfSpeech || "unknown",
            definition: d.definition,
            example: d.example || null,
          });
        });
      }
    });
  }

  return {
    phonetics: entry.phonetics || [],
    partOfSpeech: Array.from(posSet),
    enMeanings,
  };
};

// --- HELPER: FORMAT NOTE FIELD ---
export const formatNoteForSave = (meanings: EnMeaningItem[]): string => {
  return meanings
    .map((m, index) => {
      const line1 = `${index + 1}. (${m.partOfSpeech}) ${m.definition}`;
      const line2 = m.example ? `   "${m.example}"` : "";
      return line2 ? `${line1}\n${line2}` : line1;
    })
    .join("\n\n");
};
