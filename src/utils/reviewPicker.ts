import { ReviewFilter, VocabularyItem } from "@/types";

/** Số từ mặc định hiển thị trên thanh ôn nhanh ở đáy trang. */
export const REVIEW_WORDS_SIZE = 10;

/** Mốc "lần cuối đụng tới từ này" để ưu tiên từ lâu chưa gặp. */
const lastSeenAt = (w: VocabularyItem) => w.updatedAt || w.createdAt || 0;

/** Từ cũ nhất nặng gấp OLDEST_WEIGHT lần từ mới nhất - chỉ ưu tiên nhẹ, không độc chiếm. */
const OLDEST_WEIGHT = 2;

/**
 * Random có trọng số trên TOÀN BỘ nhóm (Efraimidis–Spirakis): mọi từ đều có
 * cơ hội được chọn, từ lâu chưa gặp chỉ được ưu tiên nhẹ theo thứ hạng. Trước đây
 * chỉ random trong vài chục từ cũ nhất nên bộ từ luôn dồn về những ngày đầu.
 */
const takeWeightedRandom = (pool: VocabularyItem[], amount: number) => {
  if (amount <= 0 || !pool.length) return [];
  const sorted = [...pool].sort((a, b) => lastSeenAt(a) - lastSeenAt(b));
  const last = Math.max(sorted.length - 1, 1);
  return sorted
    .map((w, rank) => {
      const weight = OLDEST_WEIGHT - ((OLDEST_WEIGHT - 1) * rank) / last;
      return { w, key: Math.pow(Math.random(), 1 / weight) };
    })
    .sort((a, b) => b.key - a.key)
    .slice(0, amount)
    .map((e) => e.w);
};

/** Áp bộ lọc (ảnh/chủ đề/loại từ/từ loại/khoảng thời gian) lên kho từ. */
export const applyReviewFilter = (
  words: VocabularyItem[],
  filter?: ReviewFilter,
): VocabularyItem[] => {
  if (!filter) return words;

  return words.filter((w) => {
    if (filter.image === "has" && !w.imageUrl) return false;
    if (filter.image === "none" && w.imageUrl) return false;

    if (filter.topicIds.length) {
      if (!w.topicId || !filter.topicIds.includes(w.topicId)) return false;
    }

    if (filter.wordTypeIds.length) {
      const typeIds = w.typeIds || [];
      if (!typeIds.some((id) => filter.wordTypeIds.includes(id))) return false;
    }

    if (filter.partOfSpeech.length) {
      const pos = w.partOfSpeech || [];
      if (!pos.some((p) => filter.partOfSpeech.includes(p))) return false;
    }

    const { start, end } = filter.dateRange || {};
    if (start && w.createdAt < start) return false;
    if (end && w.createdAt > end) return false;

    return true;
  });
};

/**
 * Chọn danh sách từ để ôn lại thụ động: ưu tiên từ chưa thuộc, random trải đều
 * toàn kho (từ lâu chưa gặp nhỉnh hơn chút), thiếu thì bù bằng từ đã thuộc.
 *
 * @param excludeIds Bộ từ đang hiển thị - né ra nếu kho từ (sau lọc) còn đủ để đổi bộ mới.
 */
export const pickReviewWords = (
  words: VocabularyItem[],
  size = REVIEW_WORDS_SIZE,
  excludeIds?: Set<string>,
  filter?: ReviewFilter,
): VocabularyItem[] => {
  const filtered = applyReviewFilter(words, filter);
  if (!filtered.length) return [];

  const remaining = excludeIds?.size
    ? filtered.filter((w) => !excludeIds.has(w.id))
    : filtered;
  const source = remaining.length >= size ? remaining : filtered;

  const unlearned = takeWeightedRandom(
    source.filter((w) => !w.isLearned),
    size,
  );
  if (unlearned.length >= size) return unlearned;

  const picked = new Set(unlearned.map((w) => w.id));
  const fillers = takeWeightedRandom(
    source.filter((w) => w.isLearned && !picked.has(w.id)),
    size - unlearned.length,
  );

  return [...unlearned, ...fillers];
};

/** Khoảng ngày tạo từ sớm nhất -> muộn nhất trong kho từ, dùng làm biên cho bộ lọc ngày. */
export const getReviewDateBounds = (words: VocabularyItem[]) => {
  if (!words.length) return null;
  let min = words[0].createdAt;
  let max = words[0].createdAt;
  for (const w of words) {
    if (w.createdAt < min) min = w.createdAt;
    if (w.createdAt > max) max = w.createdAt;
  }
  return { min, max };
};
