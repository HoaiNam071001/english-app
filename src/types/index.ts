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
}

// Kiểu dữ liệu cho báo cáo sau khi thêm
export interface AddReport {
  added: string[];
  skipped: string[];
}

export enum DataTable {
  Vocabulary = "vocabulary",
}
