/* eslint-disable react-refresh/only-export-components */
import React, { createContext, ReactNode } from "react";
import { TopicItem } from "@/types";
import { useFirebaseTopics } from "@/hooks/useTopics/useFirebaseTopics";
import { useGuestTopics } from "@/hooks/useTopics/useGuestTopics";
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
}> = ({ children, userId }) => {
  
  // 1. Gọi Hook Firebase (Logic sẽ tự pause nếu userId null nhờ check bên trong hook)
  const firebaseData = useFirebaseTopics(userId);

  // 2. Gọi Hook Guest (Chỉ enable khi không có userId)
  const guestData = useGuestTopics(userId === null);

  // 3. ADAPTER SWITCH: Chọn data nào để expose ra ngoài
  const contextValue = userId ? firebaseData : guestData;

  return (
    <TopicContext.Provider value={contextValue}>
      {children}
    </TopicContext.Provider>
  );
};

