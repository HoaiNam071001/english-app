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
import { useEffect, useState } from "react";
import { useConfirm } from "../useConfirm";
import { useToast } from "../useToast";

export const useFirebaseTopics = (userId: string | null) => {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { confirm } = useConfirm();

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
      toast.success("Topic added successfully!");
    } catch (error) {
      console.error("Error adding topic:", error);
      toast.error("Failed to add topic!");
    }
  };

  const updateTopic = async (id: string, updates: Partial<TopicItem>) => {
    try {
      await updateDoc(doc(db, DataTable.Topics, id), updates);
      toast.success("Topic updated successfully!");
    } catch (error) {
      console.error("Error updating topic:", error);
      toast.error("Failed to update topic!");
    }
  };

  const deleteTopic = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Delete Topic?",
      message:
        "Are you sure you want to delete this topic? This action cannot be undone.",
      confirmText: "Delete Now",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!isConfirmed) return;
    try {
      await deleteDoc(doc(db, DataTable.Topics, id));
      toast.success("Topic deleted successfully!");
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast.error("Failed to delete topic!");
    }
  };

  return { topics, isLoading, addTopic, updateTopic, deleteTopic };
};
