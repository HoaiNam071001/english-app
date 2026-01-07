// src/services/wordType/guest.adapter.ts
import { GUEST_INFO } from "@/constants";
import { WordType } from "@/types";
import { IWordTypeService } from "./types";

export class GuestWordTypeService implements IWordTypeService {
  private getStorageKey(): string {
    // Giả định bạn thêm key này vào constant GUEST_INFO
    // Nếu chưa có, hãy thêm: storageKey: { ..., wordTypes: "guest_word_types" }
    return GUEST_INFO.storageKey.wordTypes || "guest_word_types";
  }

  private getFromLocal(): WordType[] {
    try {
      const raw = localStorage.getItem(this.getStorageKey());
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToLocal(data: WordType[]) {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
  }

  async fetchAll(): Promise<WordType[]> {
    // Giả lập delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.getFromLocal();
  }

  async add(
    entry: Omit<WordType, "id" | "userId" | "createdAt">
  ): Promise<WordType> {
    const currentData = this.getFromLocal();

    const newItem: WordType = {
      id: crypto.randomUUID(), // Tự sinh ID cho Guest
      userId: GUEST_INFO.id,
      createdAt: Date.now(),
      ...entry,
    };

    this.saveToLocal([...currentData, newItem]);
    return newItem;
  }

  async update(id: string, updates: Partial<WordType>): Promise<void> {
    const currentData = this.getFromLocal();
    const newData = currentData.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    this.saveToLocal(newData);
  }

  async delete(id: string): Promise<void> {
    const currentData = this.getFromLocal();
    const newData = currentData.filter((item) => item.id !== id);
    this.saveToLocal(newData);
  }
}
