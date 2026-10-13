import { VocabularyItem } from "@/types";
import { createContext, useContext } from "react";
import { VocabMatchEntry } from "./matchVocab";

export interface VocabLinkContextValue {
  entries: VocabMatchEntry[];
  viewWord: (item: VocabularyItem) => void;
  createWord?: (text: string) => void;
}

export const VocabLinkContext = createContext<VocabLinkContextValue | null>(
  null,
);

/** Trả về null nếu không nằm trong VocabLinkProvider (vd: trang shared) */
export const useVocabLink = () => useContext(VocabLinkContext);
