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

// 1. Định nghĩa kiểu dữ liệu cho Context
export interface TopicContextType {
  topics: TopicItem[];
  isLoading: boolean;
  addTopic: (data: Partial<TopicItem>) => Promise<void>;
  updateTopic: (id: string, updates: Partial<TopicItem>) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
}

// 2. Khởi tạo Context
export const TopicContext = createContext<TopicContextType | undefined>(
  undefined
);

// 3. Tạo Provider Component
export const TopicProvider: React.FC<{
  children: ReactNode;
  email: string | null; // Nhận email từ App/HomePage
}> = ({ children, email }) => {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- REALTIME LISTENER ---
  useEffect(() => {
    if (!email) {
      setTopics([]);
      return;
    }

    setIsLoading(true);
    // Query topics theo email
    const q = query(
      collection(db, DataTable.Topics),
      where("email", "==", email),
      orderBy("createdAt", "desc")
    );

    // Lắng nghe thay đổi từ Firestore
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

    // Cleanup khi unmount hoặc đổi email
    return () => unsubscribe();
  }, [email]);

  // --- CRUD FUNCTIONS ---

  const addTopic = async (data: Partial<TopicItem>) => {
    if (!email) return;
    try {
      await addDoc(collection(db, DataTable.Topics), {
        ...data,
        label: data.label || "New Topic",
        email: email,
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

  // Giá trị sẽ cung cấp cho toàn bộ app
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
