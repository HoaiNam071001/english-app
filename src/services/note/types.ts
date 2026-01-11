import { NoteModel } from "@/types";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export interface PaginatedNoteResponse {
  data: NoteModel[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null; // Dùng cho Firebase
  hasMore: boolean;
}

export interface INoteService {
  /**
   * Lấy danh sách note có phân trang
   * @param pageSize Số lượng item mỗi lần load
   * @param lastDoc Doc cuối cùng của trang trước (dùng cho Firebase loadmore)
   * @param offset Số lượng item đã load (dùng cho Guest loadmore)
   */
  fetchNotes(
    pageSize: number,
    lastDoc?: QueryDocumentSnapshot<DocumentData> | null,
    keyword?: string,
    offset?: number
  ): Promise<PaginatedNoteResponse>;

  add(note: Partial<NoteModel>): Promise<NoteModel>;

  update(id: string, updates: Partial<NoteModel>): Promise<void>;

  delete(id: string): Promise<void>;
}
