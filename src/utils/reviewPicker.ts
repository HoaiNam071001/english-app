import { ReviewFilter, VocabularyItem } from "@/types";

/** Số từ mặc định hiển thị trên thanh ôn nhanh ở đáy trang. */
export const REVIEW_WORDS_SIZE = 10;

/** Mốc "lần cuối đụng tới từ này" để ưu tiên từ lâu chưa gặp. */
const lastSeenAt = (w: VocabularyItem) => w.updatedAt || w.createdAt || 0;

const shuffle = <T>(list: T[]): T[] => {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/** Lấy ngẫu nhiên trong nhóm cũ nhất để mỗi lần làm mới ra một bộ khác nhau. */
const takeOldest = (pool: VocabularyItem[], amount: number) => {
  if (amount <= 0 || !pool.length) return [];
  const sorted = [...pool].sort((a, b) => lastSeenAt(a) - lastSeenAt(b));
  return shuffle(sorted.slice(0, Math.max(amount * 3, amount))).slice(0, amount);
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
 * Chọn danh sách từ để ôn lại thụ động: ưu tiên từ chưa thuộc và lâu chưa gặp,
 * thiếu thì bù bằng từ đã thuộc (cũng theo thứ tự lâu chưa gặp nhất).
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

  const unlearned = takeOldest(
    source.filter((w) => !w.isLearned),
    size,
  );
  if (unlearned.length >= size) return unlearned;

  const picked = new Set(unlearned.map((w) => w.id));
  const fillers = takeOldest(
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
