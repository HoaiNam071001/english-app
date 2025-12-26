export interface VocabularyItem {
  id?: string; // ID từ Firestore (optional vì lúc tạo chưa có)
  text: string; // Từ tiếng Anh (hiển thị)
  meaning: string; // Nghĩa tiếng Việt
  normalized: string; // Từ tiếng Anh viết thường (để check trùng)
  email: string; // Người tạo
  createdAt: number; // Kiểu thời gian của Firebase
  updatedAt: number;
  isLearned?: boolean;
  example?: string;
  topicId?: string | null; // <--- Change: Allow null
}

// Kiểu dữ liệu cho báo cáo sau khi thêm
export interface AddReport {
  added: string[];
  skipped: string[];
}

export enum DataTable {
  Vocabulary = "vocabulary",
  Topics = "topics",
  USER ='users'
}

export interface TopicItem {
  id: string;
  label: string;
  desc?: string;
  color?: string;
  icon?: string;
  email: string;
  createdAt: number;
  updatedAt?: number;
}

export enum UserRole {
  ADMIN= 'admin',
  USER = 'user'
}

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
};

export interface UserProfile {
  id: string; 
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: number;
  lastLoginAt: number;
}