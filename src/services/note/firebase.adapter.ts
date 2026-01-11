import { db } from "@/firebaseConfig";
import { DataTable, NoteModel } from "@/types"; // Giả định bạn đã thêm 'Notes' vào enum DataTable
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
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
} from "firebase/firestore";
import { INoteService, PaginatedNoteResponse } from "./types";

export class FirebaseNoteService implements INoteService {
  constructor(private userId: string) {}

  async fetchNotes(
    pageSize: number,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null,
    keyword: string = ""
  ): Promise<PaginatedNoteResponse> {
    const colRef = collection(db, DataTable.Notes || "notes");
    let q: Query<DocumentData, DocumentData>;

    if (keyword && keyword.trim() !== "") {
      const searchStr = keyword.toLowerCase().trim();

      q = query(
        colRef,
        where("userId", "==", this.userId),
        where("normalizedTitle", ">=", searchStr),
        where("normalizedTitle", "<=", searchStr + "\uf8ff"),
        orderBy("normalizedTitle"),
        orderBy("updatedAt", "desc"),
        limit(pageSize)
      );
    }
    // --- CASE 2: KHÔNG CÓ TỪ KHÓA (Load list bình thường) ---
    else {
      q = query(
        colRef,
        where("userId", "==", this.userId),
        orderBy("updatedAt", "desc"),
        limit(pageSize)
      );
    }

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
    })) as NoteModel[];

    const hasMore = snapshot.docs.length === pageSize;

    return { data, lastVisible, hasMore };
  }

  async add(note: Partial<NoteModel>): Promise<NoteModel> {
    const colRef = collection(db, DataTable.Notes);
    const normalizedTitle = note.title ? note.title.toLowerCase() : "";
    const docRef = await addDoc(colRef, {
      ...note,
      userId: this.userId,
      normalizedTitle,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...note,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: this.userId,
    } as NoteModel;
  }

  async update(id: string, updates: Partial<NoteModel>): Promise<void> {
    if (updates?.title) {
      updates.normalizedTitle = updates.title
        ? updates.title.toLowerCase()
        : "";
    }
    const { id: _, createdAt, ...rest } = updates;

    await updateDoc(doc(db, DataTable.Notes, id), {
      ...rest,
      updatedAt: serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, DataTable.Notes, id));
  }
}
