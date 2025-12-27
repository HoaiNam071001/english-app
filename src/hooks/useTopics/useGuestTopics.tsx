import { GUEST_INFO } from "@/constants";
import { TopicItem } from "@/types";
import { useEffect, useState } from "react";
import { useConfirm } from "../useConfirm";

export const useGuestTopics = (enabled: boolean) => {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { confirm } = useConfirm();

  // Helper
  const saveToLocal = (data: TopicItem[]) => {
    localStorage.setItem(GUEST_INFO.storageKey.topic, JSON.stringify(data));
    setTopics(data);
  };

  const getFromLocal = (): TopicItem[] => {
    try {
      const raw = localStorage.getItem(GUEST_INFO.storageKey.topic);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  // --- 1. FETCH ---
  useEffect(() => {
    if (!enabled) return; // Không chạy nếu là user thật

    setIsLoading(true);
    // Giả lập delay nhẹ
    setTimeout(() => {
      const localTopics = getFromLocal().sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );
      setTopics(localTopics);
      setIsLoading(false);
    }, 300);
  }, [enabled]);

  // --- 2. ACTIONS ---
  const addTopic = async (data: Partial<TopicItem>) => {
    const now = Date.now();
    const newTopic: TopicItem = {
      id: crypto.randomUUID(),
      userId: "guest",
      createdAt: now,
      label: data.label || "New Topic",
      ...data,
    };

    const currentTopics = getFromLocal();
    saveToLocal([newTopic, ...currentTopics]);
  };

  const updateTopic = async (id: string, updates: Partial<TopicItem>) => {
    const currentTopics = getFromLocal();
    const updatedList = currentTopics.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    saveToLocal(updatedList);
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

    const currentTopics = getFromLocal();
    const filteredList = currentTopics.filter((t) => t.id !== id);
    saveToLocal(filteredList);
  };

  return { topics, isLoading, addTopic, updateTopic, deleteTopic };
};
