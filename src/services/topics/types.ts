// services/topics/types.ts
import { TopicItem } from "@/types";

export type TopicListener = (topics: TopicItem[]) => void;

export interface ITopicService {
  // Hàm này trả về 1 function để unsubscribe (ngắt kết nối)
  subscribe(onData: TopicListener, onError?: (error) => void): () => void;

  add(data: Partial<TopicItem>): Promise<void>;
  update(id: string, updates: Partial<TopicItem>): Promise<void>;
  delete(id: string): Promise<void>;
}
