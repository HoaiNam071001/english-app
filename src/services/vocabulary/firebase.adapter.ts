// services/vocabulary/firebase.adapter.ts
import { db } from "@/firebaseConfig";
import { AddReport, DataTable, VocabularyItem } from "@/types";
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  Query,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { IVocabularyService } from "./types";

export interface PaginatedResponse {
  data: VocabularyItem[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  total: number;
}

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
      updatedAt: doc.data().updatedAt?.toMillis() || 0,
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
      const normalized = entry.text!.toLowerCase();

      if (
        existingSet.has(normalized) ||
        currentBatchSet.has(entry.normalized!)
      ) {
        skippedWords.push(entry.text!);
      } else {
        const newDocRef = doc(collection(db, DataTable.Vocabulary));
        const docData = {
          ...entry,
          normalized: normalized,
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
    await updateDoc(doc(db, DataTable.Vocabulary, id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
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
      batch.update(doc(db, DataTable.Vocabulary, id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  }

  async fetchSharedPage(
    pageSize: number,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null,
    keyword: string = ""
  ): Promise<PaginatedResponse> {
    const colRef = collection(db, DataTable.Vocabulary);
    let baseQuery = query(
      colRef,
      where("isShared", "==", true),
      where("userId", "!=", this.userId)
    );

    if (keyword.trim()) {
      const searchStr = keyword.toLowerCase().trim();
      baseQuery = query(
        baseQuery,
        where("normalized", ">=", searchStr),
        where("normalized", "<=", searchStr + "\uf8ff")
      );
    }

    // 1. Lấy tổng số (chỉ làm lần đầu hoặc khi cần update số trang)
    const countSnapshot = await getCountFromServer(baseQuery);
    const total = countSnapshot.data().count;

    // 2. Xây dựng Query
    let q: Query<DocumentData, DocumentData>;
    if (keyword.trim()) {
      q = query(
        baseQuery,
        orderBy("normalized"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else {
      q = query(baseQuery, orderBy("createdAt", "desc"), limit(pageSize));
    }

    // Nếu có lastDoc thì bắt đầu truy vấn từ sau doc đó
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || 0,
      updatedAt: doc.data().updatedAt?.toMillis() || 0,
    })) as VocabularyItem[];

    return { data, lastVisible, total };
  }
}
