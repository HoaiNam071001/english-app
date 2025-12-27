// services/topics/firebase.adapter.ts
import { db } from "@/firebaseConfig";
import { DataTable, TopicItem } from "@/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { ITopicService, TopicListener } from "./types";

export class FirebaseTopicService implements ITopicService {
  constructor(private userId: string) {}

  subscribe(onData: TopicListener, onError?: (error) => void): () => void {
    const q = query(
      collection(db, DataTable.Topics),
      where("userId", "==", this.userId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const fetchedTopics = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toMillis?.() || 0,
        })) as TopicItem[];
        onData(fetchedTopics);
      },
      (error) => {
        if (onError) onError(error);
        else console.error("Firebase Topic Error:", error);
      }
    );
  }

  async add(data: Partial<TopicItem>): Promise<void> {
    await addDoc(collection(db, DataTable.Topics), {
      ...data,
      label: data.label || "New Topic",
      userId: this.userId,
      createdAt: serverTimestamp(),
    });
  }

  async update(id: string, updates: Partial<TopicItem>): Promise<void> {
    await updateDoc(doc(db, DataTable.Topics, id), updates);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, DataTable.Topics, id));
  }
}
