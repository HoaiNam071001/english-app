// services/vocabulary/types.ts
import { AddReport, VocabularyItem } from "@/types";

export interface IVocabularyService {
  fetchAll(): Promise<VocabularyItem[]>;

  add(
    newEntries: Partial<VocabularyItem>[],
    currentItems: VocabularyItem[] // Cần truyền vào để check trùng
  ): Promise<AddReport>;

  update(id: string, updates: Partial<VocabularyItem>): Promise<void>;

  delete(id: string): Promise<void>;

  bulkDelete(ids: string[]): Promise<void>;

  bulkUpdate(ids: string[], updates: Partial<VocabularyItem>): Promise<void>;
}
