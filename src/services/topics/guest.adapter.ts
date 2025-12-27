// services/topics/guest.adapter.ts
import { GUEST_INFO } from "@/constants";
import { TopicItem } from "@/types";
import { ITopicService, TopicListener } from "./types";

export class GuestTopicService implements ITopicService {
  private listeners: TopicListener[] = [];

  private getFromLocal(): TopicItem[] {
    try {
      const raw = localStorage.getItem(GUEST_INFO.storageKey.topic);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToLocal(data: TopicItem[]) {
    localStorage.setItem(GUEST_INFO.storageKey.topic, JSON.stringify(data));
    // Mấu chốt: Khi save xong, thông báo cho tất cả listener (Giả lập Realtime)
    this.notifyListeners(data);
  }

  private notifyListeners(data: TopicItem[]) {
    // Sort luôn trước khi trả về để đồng bộ với Firebase
    const sortedData = data.sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
    this.listeners.forEach((listener) => listener(sortedData));
  }

  // --- INTERFACE IMPLEMENTATION ---

  subscribe(onData: TopicListener): () => void {
    this.listeners.push(onData);

    // Trigger lần đầu tiên (Initial fetch)
    // Dùng setTimeout để giả lập độ trễ mạng nhẹ
    setTimeout(() => {
      onData(
        this.getFromLocal().sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        )
      );
    }, 300);

    // Trả về hàm cleanup
    return () => {
      this.listeners = this.listeners.filter((l) => l !== onData);
    };
  }

  async add(data: Partial<TopicItem>): Promise<void> {
    const now = Date.now();
    const newTopic: TopicItem = {
      id: crypto.randomUUID(),
      userId: GUEST_INFO.id,
      createdAt: now,
      label: data.label || "New Topic",
      ...data,
    };
    const current = this.getFromLocal();
    this.saveToLocal([newTopic, ...current]);
  }

  async update(id: string, updates: Partial<TopicItem>): Promise<void> {
    const current = this.getFromLocal();
    const updated = current.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    this.saveToLocal(updated);
  }

  async delete(id: string): Promise<void> {
    const current = this.getFromLocal();
    const filtered = current.filter((t) => t.id !== id);
    this.saveToLocal(filtered);
  }
}
