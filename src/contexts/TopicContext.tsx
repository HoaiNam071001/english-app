/* eslint-disable react-refresh/only-export-components */
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
import React, { createContext, ReactNode, useEffect, useState } from "react";

export interface TopicContextType {
  topics: TopicItem[];
  isLoading: boolean;
  addTopic: (data: Partial<TopicItem>) => Promise<void>;
  updateTopic: (id: string, updates: Partial<TopicItem>) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
}

export const TopicContext = createContext<TopicContextType | undefined>(
  undefined
);

export const TopicProvider: React.FC<{
  children: ReactNode;
  userId: string | null; // <--- Đổi tên prop từ email -> userId
}> = ({ children, userId }) => {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- REALTIME LISTENER ---
  useEffect(() => {
    if (!userId) {
      setTopics([]);
      return;
    }

    setIsLoading(true);
    // Query topics theo userId
    const q = query(
      collection(db, DataTable.Topics),
      where("userId", "==", userId), // <--- SỬ DỤNG USER ID
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTopics = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toMillis() || 0,
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

  // --- CRUD FUNCTIONS ---

  const addTopic = async (data: Partial<TopicItem>) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, DataTable.Topics), {
        ...data,
        label: data.label || "New Topic",
        userId: userId, // <--- LƯU USER ID
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

  const value = {
    topics,
    isLoading,
    addTopic,
    updateTopic,
    deleteTopic,
  };

  return (
    <TopicContext.Provider value={value}>{children}</TopicContext.Provider>
  );
};