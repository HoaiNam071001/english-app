import { AccentType } from "./dictionary";

export * from "./dictionary";
export enum PartOfSpeech {
  NOUN = "noun",
  VERB = "verb",
  ADJECTIVE = "adjective",
  ADVERB = "adverb",
  PRONOUN = "pronoun",
  PREPOSITION = "preposition",
  CONJUNCTION = "conjunction",
  INTERJECTION = "interjection",
  PHRASAL_VERB = "phrasal verb", // API hay trả về cái này
  IDIOM = "idiom",
  OTHER = "other",
}

// 2. Sub-type cho IPA
export interface PhoneticItem {
  text: string; // Ví dụ: /həˈləʊ/
  audio?: string; // Link mp3 (Optional)
  accent?: AccentType; // Field mới
}

export interface VocabularyItem {
  id?: string; // ID từ Firestore (optional vì lúc tạo chưa có)
  text: string; // Từ tiếng Anh (hiển thị)
  meaning: string; // Nghĩa tiếng Việt
  normalized: string; // Từ tiếng Anh viết thường (để check trùng)
  createdAt: number; // Kiểu thời gian của Firebase
  updatedAt: number;

  isLearned?: boolean;
  isShared?: boolean;
  isPinned?: boolean;

  example?: string;
  topicId?: string | null;
  phonetics?: PhoneticItem[];
  partOfSpeech?: PartOfSpeech[];
  userId: string;
}

export interface BatchUpdateVocabularyItem {
  id: string;
  updates: Partial<VocabularyItem>;
}

// Kiểu dữ liệu cho báo cáo sau khi thêm
export interface AddReport {
  added: string[];
  skipped: string[];
}

export enum DataTable {
  Vocabulary = "vocabulary",
  Topics = "topics",
  USER = "users",
}

export interface TopicItem {
  id: string;
  label: string;
  desc?: string;
  userId: string;
  color?: string;
  icon?: string;
  createdAt: number;
  updatedAt?: number;
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export enum UserStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: number;
  lastLoginAt: number;
  approvedBy?: string;
  approvedAt?: number;
  photoURL?: string | null;
  emailId?: string;
}

export interface SavedAccount {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  lastLogin: number;
}

// card tabs
export interface TabSession {
  id: string;
  title: string;
  wordIds: string[]; // Quan trọng: Lưu danh sách ID bài học
  flippedIds: Set<string>;
  meaningIds: Set<string>;
}
