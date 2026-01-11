import { GUEST_INFO } from "@/constants";
import { NoteModel } from "@/types";
import { INoteService, PaginatedNoteResponse } from "./types";

export class GuestNoteService implements INoteService {
  private getFromLocal(): NoteModel[] {
    try {
      const raw = localStorage.getItem(
        GUEST_INFO.storageKey.notes || "guest_notes"
      );
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToLocal(data: NoteModel[]) {
    localStorage.setItem(
      GUEST_INFO.storageKey.notes || "guest_notes",
      JSON.stringify(data)
    );
  }

  async fetchNotes(
    pageSize: number,
    _lastDoc = null,
    keyword: string = "",
    offset: number = 0
  ): Promise<PaginatedNoteResponse> {
    // Giả lập network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    let allNotes = this.getFromLocal();

    // 1. FILTER: Lọc theo keyword trước khi sort và paginate
    if (keyword && keyword.trim() !== "") {
      const searchStr = keyword.toLowerCase().trim();
      allNotes = allNotes.filter((note) =>
        note.title.toLowerCase().includes(searchStr)
      );
    }

    // 2. SORT: Sắp xếp giảm dần theo thời gian update
    const sorted = allNotes.sort((a, b) => b.updatedAt - a.updatedAt);

    // 3. PAGINATE: Cắt mảng
    const data = sorted.slice(offset, offset + pageSize);
    const hasMore = offset + pageSize < sorted.length;

    return { data, lastVisible: null, hasMore };
  }

  async add(note: Omit<NoteModel, "id" | "userId">): Promise<NoteModel> {
    const currentItems = this.getFromLocal();
    const now = Date.now();

    const newNote: NoteModel = {
      id: crypto.randomUUID(),
      ...note,
      createdAt: now,
      updatedAt: now,
      userId: GUEST_INFO.id,
    };

    this.saveToLocal([newNote, ...currentItems]);
    return newNote;
  }

  async update(id: string, updates: Partial<NoteModel>): Promise<void> {
    const currentItems = this.getFromLocal();
    const now = Date.now();

    // Loại bỏ id và createdAt khỏi updates để tránh ghi đè sai
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, createdAt, ...rest } = updates;

    const newItems = currentItems.map((item) =>
      item.id === id ? { ...item, ...rest, updatedAt: now } : item
    );

    this.saveToLocal(newItems);
  }

  async delete(id: string): Promise<void> {
    const currentItems = this.getFromLocal();
    const newItems = currentItems.filter((item) => item.id !== id);
    this.saveToLocal(newItems);
  }
}
