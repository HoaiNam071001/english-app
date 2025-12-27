/* eslint-disable react-refresh/only-export-components */
import { useAuth } from "@/hooks/useAuth";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { FirebaseTopicService } from "@/services/topics/firebase.adapter";
import { GuestTopicService } from "@/services/topics/guest.adapter";
import { ITopicService } from "@/services/topics/types";
import { TopicItem } from "@/types";
import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  userId: string | null;
}> = ({ children }) => {
  const { userProfile } = useAuth();
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();
  const { confirm } = useConfirm();

  const service: ITopicService = useMemo(() => {
    return userProfile?.id
      ? new FirebaseTopicService(userProfile?.id)
      : new GuestTopicService();
  }, [userProfile]);

  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = service.subscribe(
      (data) => {
        setTopics(data);
        setIsLoading(false);
      },
      (error) => {
        console.error("Topic subscription error:", error);
        setIsLoading(false);
      }
    );

    // Cleanup khi unmount hoặc đổi user
    return () => unsubscribe();
  }, [service]);

  // 3. Actions
  const addTopic = async (data: Partial<TopicItem>) => {
    try {
      // Optimistic update không cần thiết lắm ở đây vì Listener sẽ phản hồi rất nhanh
      await service.add(data);
      toast.success("Topic added successfully!");
    } catch (error) {
      console.error("Error adding topic:", error);
      toast.error("Failed to add topic!");
    }
  };

  const updateTopic = async (id: string, updates: Partial<TopicItem>) => {
    try {
      await service.update(id, updates);
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
      await service.delete(id);
      toast.success("Topic deleted successfully!");
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast.error("Failed to delete topic!");
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
