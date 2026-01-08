import { VocabularyItem } from "@/types";

export const clonedVocabularyItem = (
  item: VocabularyItem
): Partial<VocabularyItem> => {
  return {
    text: item.text,
    meaning: item.meaning,
    normalized: item.normalized,
    example: item.example,
    phonetics: item.phonetics,
    partOfSpeech: item.partOfSpeech,
    imageUrl: item.imageUrl,
  };
};
