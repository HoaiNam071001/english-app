// hooks/useTopics.ts
import { TopicContext } from "@/contexts/TopicContext";
import { useContext } from "react";

export const useTopics = () => {
  const context = useContext(TopicContext);
  if (!context) {
    throw new Error("useTopics must be used within a TopicProvider");
  }
  return context;
};
