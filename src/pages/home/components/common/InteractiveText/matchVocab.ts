import { VocabularyItem } from "@/types";

export interface VocabMatchEntry {
  key: string; // text viết thường, đã trim
  item: VocabularyItem;
}

export interface TextSegment {
  text: string;
  /** Các từ trong bộ từ phủ lên đoạn này (rỗng = text thường) */
  matches: VocabularyItem[];
}

// Bỏ qua các từ quá ngắn (vd: "a") để tránh highlight tràn lan
const MIN_KEY_LENGTH = 2;
const WORD_CHAR = /[\p{L}\p{N}]/u;

export const buildMatchEntries = (words: VocabularyItem[]): VocabMatchEntry[] =>
  words
    .map((item) => ({ key: item.text?.trim().toLowerCase() || "", item }))
    .filter((e) => e.key.length >= MIN_KEY_LENGTH);

const isBoundary = (text: string, index: number) =>
  index < 0 || index >= text.length || !WORD_CHAR.test(text[index]);

/**
 * Tách `text` thành các đoạn theo vị trí khớp với bộ từ (không phân biệt hoa/thường,
 * phải trọn từ). Các cụm chồng nhau (vd: "flaky" và "A flaky") được chia nhỏ tại mọi
 * điểm biên, nên đoạn "flaky" sẽ mang cả 2 từ khớp.
 */
export const segmentByVocab = (
  text: string,
  entries: VocabMatchEntry[],
  excludeId?: string,
): TextSegment[] => {
  if (!text) return [];
  const lower = text.toLowerCase();
  const ranges: { start: number; end: number; item: VocabularyItem }[] = [];

  for (const { key, item } of entries) {
    if (excludeId && item.id === excludeId) continue;
    let from = 0;
    while (from <= lower.length - key.length) {
      const idx = lower.indexOf(key, from);
      if (idx === -1) break;
      const end = idx + key.length;
      if (isBoundary(lower, idx - 1) && isBoundary(lower, end)) {
        ranges.push({ start: idx, end, item });
      }
      from = idx + 1;
    }
  }

  if (ranges.length === 0) return [{ text, matches: [] }];

  const points = new Set<number>([0, text.length]);
  ranges.forEach((r) => {
    points.add(r.start);
    points.add(r.end);
  });
  const sorted = [...points].sort((a, b) => a - b);

  const segments: TextSegment[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    // Cụm dài hơn đứng trước
    const covering = ranges
      .filter((r) => r.start <= a && r.end >= b)
      .sort((x, y) => y.end - y.start - (x.end - x.start));
    const matches = [...new Set(covering.map((r) => r.item))];
    const last = segments[segments.length - 1];
    // Gộp các đoạn text thường liền nhau
    if (matches.length === 0 && last && last.matches.length === 0) {
      last.text += text.slice(a, b);
    } else {
      segments.push({ text: text.slice(a, b), matches });
    }
  }
  return segments;
};
