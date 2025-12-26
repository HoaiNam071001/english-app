import { useState, useEffect } from "react";
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

export const useFirebaseTopics = (userId: string | null) => {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. FETCH / LISTEN ---
  useEffect(() => {
    if (!userId) {
      setTopics([]); // Clear data nếu không có user
      return;
    }

    setIsLoading(true);
    const q = query(
      collection(db, DataTable.Topics),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTopics = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toMillis?.() || 0,
        })) as TopicItem[];

        setTopics(fetchedTopics);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to topics:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // --- 2. ACTIONS ---
  const addTopic = async (data: Partial<TopicItem>) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, DataTable.Topics), {
        ...data,
        label: data.label || "New Topic",
        userId: userId,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding topic:", error);
    }
  };

  const updateTopic = async (id: string, updates: Partial<TopicItem>) => {
    try {
      await updateDoc(doc(db, DataTable.Topics, id), updates);
    } catch (error) {
      console.error("Error updating topic:", error);
    }
  };

  const deleteTopic = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    try {
      await deleteDoc(doc(db, DataTable.Topics, id));
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  return { topics, isLoading, addTopic, updateTopic, deleteTopic };
};
