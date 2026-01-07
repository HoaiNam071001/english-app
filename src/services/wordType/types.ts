// src/services/wordType/types.ts
import { WordType } from "@/types";

export interface IWordTypeService {
  fetchAll(): Promise<WordType[]>;

  add(type: Omit<WordType, "id" | "userId" | "createdAt">): Promise<WordType>;

  update(id: string, updates: Partial<WordType>): Promise<void>;

  delete(id: string): Promise<void>;
}
