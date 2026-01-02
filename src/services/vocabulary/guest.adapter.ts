// services/vocabulary/guest.adapter.ts
import { GUEST_INFO } from "@/constants";
import { AddReport, VocabularyItem } from "@/types";
import { IVocabularyService } from "./types";

export class GuestVocabularyService implements IVocabularyService {
  private getFromLocal(): VocabularyItem[] {
    try {
      const raw = localStorage.getItem(GUEST_INFO.storageKey.vocabulary);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToLocal(data: VocabularyItem[]) {
    localStorage.setItem(
      GUEST_INFO.storageKey.vocabulary,
      JSON.stringify(data)
    );
  }

  async fetchAll(): Promise<VocabularyItem[]> {
    // Giả lập delay nhỏ để giống hành vi async
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.getFromLocal().sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
  }

  async add(
    newEntries: Partial<VocabularyItem>[],
    currentItems: VocabularyItem[]
  ): Promise<AddReport> {
    const existingSet = new Set(currentItems.map((w) => w.normalized));
    const addedWords: string[] = [];
    const skippedWords: string[] = [];
    const entriesToAdd: VocabularyItem[] = [];

    newEntries.forEach((entry) => {
      const normalized = entry.text!.toLowerCase();

      if (existingSet.has(normalized)) {
        skippedWords.push(entry.text!);
      } else {
        const now = Date.now();
        entriesToAdd.push({
          id: crypto.randomUUID(),
          ...entry,
          normalized: normalized,
          topicId: entry.topicId,
          userId: GUEST_INFO.id,
          createdAt: now,
          updatedAt: now,
          isLearned: false,
        } as VocabularyItem);
        addedWords.push(entry.text!);
      }
    });

    if (entriesToAdd.length > 0) {
      this.saveToLocal([...entriesToAdd, ...currentItems]);
    }

    return { added: addedWords, skipped: skippedWords };
  }

  async update(id: string, updates: Partial<VocabularyItem>): Promise<void> {
    const currentData = this.getFromLocal();
    const newData = currentData.map((w) =>
      w.id === id ? { ...w, ...updates } : w
    );
    this.saveToLocal(newData);
  }

  async delete(id: string): Promise<void> {
    const currentData = this.getFromLocal();
    const newData = currentData.filter((w) => w.id !== id);
    this.saveToLocal(newData);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    const currentData = this.getFromLocal();
    const newData = currentData.filter((w) => !ids.includes(w.id));
    this.saveToLocal(newData);
  }

  async bulkUpdate(
    ids: string[],
    updates: Partial<VocabularyItem>
  ): Promise<void> {
    const currentData = this.getFromLocal();
    const newData = currentData.map((w) =>
      ids.includes(w.id) ? { ...w, ...updates } : w
    );
    this.saveToLocal(newData);
  }
}
