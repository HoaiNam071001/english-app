// services/vocabulary/firebase.adapter.ts
import { db } from "@/firebaseConfig";
import { AddReport, DataTable, VocabularyItem } from "@/types";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { IVocabularyService } from "./types";

export class FirebaseVocabularyService implements IVocabularyService {
  constructor(private userId: string) {}

  async fetchAll(): Promise<VocabularyItem[]> {
    const q = query(
      collection(db, DataTable.Vocabulary),
      where("userId", "==", this.userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || 0,
      isLearned: doc.data().isLearned || false,
    })) as VocabularyItem[];
  }

  async add(
    newEntries: Partial<VocabularyItem>[],
    currentItems: VocabularyItem[]
  ): Promise<AddReport> {
    const existingSet = new Set(currentItems.map((w) => w.normalized));
    const currentBatchSet = new Set<string>();

    const batch = writeBatch(db);
    const addedWords: string[] = [];
    const skippedWords: string[] = [];

    newEntries.forEach((entry) => {
      if (
        existingSet.has(entry.normalized!) ||
        currentBatchSet.has(entry.normalized!)
      ) {
        skippedWords.push(entry.text!);
      } else {
        const newDocRef = doc(collection(db, DataTable.Vocabulary));
        const docData = {
          text: entry.text,
          meaning: entry.meaning,
          normalized: entry.normalized,
          example: entry.example || null,
          topicId: entry.topicId || null,
          userId: this.userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isLearned: false,
        };

        batch.set(newDocRef, docData);

        currentBatchSet.add(entry.normalized!);
        addedWords.push(entry.text!);
      }
    });

    if (addedWords.length > 0) {
      await batch.commit();
    }
    return { added: addedWords, skipped: skippedWords };
  }

  async update(id: string, updates: Partial<VocabularyItem>): Promise<void> {
    await updateDoc(doc(db, DataTable.Vocabulary, id), updates);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, DataTable.Vocabulary, id));
  }

  async bulkDelete(ids: string[]): Promise<void> {
    const batch = writeBatch(db);
    ids.forEach((id) => batch.delete(doc(db, DataTable.Vocabulary, id)));
    await batch.commit();
  }

  async bulkUpdate(
    ids: string[],
    updates: Partial<VocabularyItem>
  ): Promise<void> {
    const batch = writeBatch(db);
    ids.forEach((id) => {
      batch.update(doc(db, DataTable.Vocabulary, id), updates);
    });
    await batch.commit();
  }
}
