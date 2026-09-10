import { PartOfSpeech } from "./index";

/** Lọc theo ảnh: có ảnh / không ảnh / không lọc. */
export type ReviewImageFilter = "all" | "has" | "none";

export interface ReviewDateRange {
  /** Mốc thời gian bắt đầu (ms). Bỏ trống = không giới hạn cận dưới. */
  start?: number;
  /** Mốc thời gian kết thúc (ms). Bỏ trống = không giới hạn cận trên. */
  end?: number;
}

export interface ReviewFilter {
  image: ReviewImageFilter;
  /** Rỗng = tất cả chủ đề. */
  topicIds: string[];
  /** Rỗng = tất cả loại từ. */
  wordTypeIds: string[];
  /** Rỗng = tất cả từ loại. */
  partOfSpeech: PartOfSpeech[];
  dateRange: ReviewDateRange;
}

/** Cách tô màu nền card khi từ chưa có ảnh. */
export type ReviewColorMode = "random" | "custom" | "topic";

/** Các field thông tin phụ có thể bật/tắt hiển thị trên mini card (ngoài từ + ảnh). */
export type ReviewCardDetailField =
  | "meaning"
  | "phonetics"
  | "partOfSpeech"
  | "wordTypes"
  | "topic";

/** Số field phụ tối đa được bật cùng lúc, để card nhỏ không bị rối. */
export const REVIEW_DETAIL_FIELDS_MAX = 2;

export interface ReviewCardStyle {
  colorMode: ReviewColorMode;
  /** Danh sách id màu (khớp TOPIC_COLORS) dùng khi colorMode = "custom". Rỗng = như random. */
  customColorIds: string[];
  /** Có hiển thị ảnh minh hoạ trên card hay không (khi từ có ảnh). */
  showImage: boolean;
  /** Tối đa REVIEW_DETAIL_FIELDS_MAX field được bật cùng lúc. */
  detailFields: ReviewCardDetailField[];
}

export interface ReviewConfig {
  /** Số giây đếm ngược trước khi tự động đổi bộ từ mới. */
  intervalSeconds: number;
  /** Số card hiển thị mỗi lần. */
  cardCount: number;
  filter: ReviewFilter;
  style: ReviewCardStyle;
}

export const REVIEW_INTERVAL_MIN = 10;
export const REVIEW_INTERVAL_MAX = 300;
export const REVIEW_CARD_COUNT_MIN = 1;
export const REVIEW_CARD_COUNT_MAX = 30;

export const DEFAULT_REVIEW_FILTER: ReviewFilter = {
  image: "all",
  topicIds: [],
  wordTypeIds: [],
  partOfSpeech: [],
  dateRange: {},
};

export const DEFAULT_REVIEW_CARD_STYLE: ReviewCardStyle = {
  colorMode: "random",
  customColorIds: [],
  showImage: true,
  detailFields: ["phonetics"],
};

export const DEFAULT_REVIEW_CONFIG: ReviewConfig = {
  intervalSeconds: 30,
  cardCount: 10,
  filter: DEFAULT_REVIEW_FILTER,
  style: DEFAULT_REVIEW_CARD_STYLE,
};

/** Merge dữ liệu đã lưu (có thể thiếu field nếu là bản cũ) với default,
 *  để sau này thêm cờ filter/style mới vẫn có giá trị mặc định an toàn. */
export const mergeReviewConfig = (
  partial?: Partial<ReviewConfig> | null,
): ReviewConfig => ({
  ...DEFAULT_REVIEW_CONFIG,
  ...partial,
  filter: {
    ...DEFAULT_REVIEW_FILTER,
    ...partial?.filter,
  },
  style: {
    ...DEFAULT_REVIEW_CARD_STYLE,
    ...partial?.style,
  },
});
