// src/services/wordType/firebase.adapter.ts
import { db } from "@/firebaseConfig";
import { DataTable, WordType } from "@/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { IWordTypeService } from "./types";

export class FirebaseWordTypeService implements IWordTypeService {
  constructor(private userId: string) {}

  async fetchAll(): Promise<WordType[]> {
    const q = query(
      collection(db, DataTable.WordType),
      where("userId", "==", this.userId),
      orderBy("createdAt", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now(),
    })) as WordType[];
  }

  async add(
    entry: Omit<WordType, "id" | "userId" | "createdAt">
  ): Promise<WordType> {
    const colRef = collection(db, DataTable.WordType);

    // Firestore tự sinh ID khi dùng addDoc
    const docRef = await addDoc(colRef, {
      ...entry,
      userId: this.userId,
      createdAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      userId: this.userId,
      createdAt: Date.now(),
      ...entry,
    };
  }

  async update(id: string, updates: Partial<WordType>): Promise<void> {
    // Không cho phép update userId hoặc id
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, userId: __, createdAt: ___, ...safeUpdates } = updates;

    await updateDoc(doc(db, DataTable.WordType, id), safeUpdates);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, DataTable.WordType, id));
  }
}
