import { GUEST_INFO, STORAGE_KEY } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { TabSession } from "@/types";
import { useEffect, useRef, useState } from "react";

// Định nghĩa Type cho Storage
interface StoredTabSession {
  id: string;
  title: string;
  wordIds: string[];
  flippedIds: string[];
  meaningIds: string[];
}

interface StoredData {
  date: string;
  userId: string;
  activeTabId: string;
  tabs: StoredTabSession[];
}

const getTodayString = () => new Date().toISOString().split("T")[0];

export const useTabSession = () => {
  const { userProfile, isGuest } = useAuth();
  const userId = isGuest ? GUEST_INFO.name : userProfile?.email || "unknown";
  const storageKey = `${STORAGE_KEY.CAR_TABS}${userId}`;

  const [tabs, setTabs] = useState<TabSession[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("tab-default");

  // State chứa dữ liệu cũ nếu khác ngày
  const [staleData, setStaleData] = useState<{
    tabs: TabSession[];
    activeTabId: string;
  } | null>(null);

  // State đánh dấu đã load xong (dù có data hay không)
  const [isLoaded, setIsLoaded] = useState(false);
  const isHydrated = useRef(false);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    setIsLoaded(false);
    isHydrated.current = false;
    setStaleData(null);

    // Dùng setTimeout để không block UI lúc mount component
    const timer = setTimeout(() => {
      try {
        const rawData = localStorage.getItem(storageKey);
        if (rawData) {
          const parsed: StoredData = JSON.parse(rawData);
          const todayStr = getTodayString();

          // Validate User
          if (parsed.userId === userId) {
            // Hydrate Data
            const hydratedTabs: TabSession[] = parsed.tabs.map((t) => ({
              id: t.id,
              title: t.title,
              wordIds: t.wordIds || [],
              flippedIds: new Set(t.flippedIds),
              meaningIds: new Set(t.meaningIds),
            }));

            if (parsed.date === todayStr) {
              // Cùng ngày -> Load luôn
              setTabs(hydratedTabs);
              setActiveTabId(parsed.activeTabId);
            } else {
              // Khác ngày -> Lưu vào staleData để hỏi user
              setStaleData({
                tabs: hydratedTabs,
                activeTabId: parsed.activeTabId,
              });
            }
          } else {
            // Khác user -> Xóa cache
            localStorage.removeItem(storageKey);
          }
        }
      } catch (error) {
        console.error("Failed to load session:", error);
        localStorage.removeItem(storageKey);
      } finally {
        setIsLoaded(true);
        isHydrated.current = true;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [userId, storageKey]);

  // --- 2. SAVE DATA (Debounced / Async) ---
  useEffect(() => {
    if (!isHydrated.current) return;

    // Chỉ save khi có tabs (nếu rỗng thì coi như đã reset hoặc chưa init)
    if (tabs?.length > 0) {
      const timer = setTimeout(() => {
        const todayStr = getTodayString();
        const tabsToStore: StoredTabSession[] = tabs.map((t) => ({
          id: t.id,
          title: t.title,
          wordIds: t.wordIds,
          flippedIds: Array.from(t.flippedIds || []),
          meaningIds: Array.from(t.meaningIds || []),
        }));

        const dataToStore: StoredData = {
          date: todayStr,
          userId: userId,
          activeTabId: activeTabId,
          tabs: tabsToStore,
        };

        localStorage.setItem(storageKey, JSON.stringify(dataToStore));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [tabs, activeTabId, userId, storageKey]);

  // --- ACTIONS ---

  // Dùng lại session cũ (Update lại date thành hôm nay)
  const restoreStaleSession = () => {
    if (staleData) {
      setTabs(staleData.tabs);
      setActiveTabId(staleData.activeTabId);
      setStaleData(null);
    }
  };

  // Xóa session để init mới
  const resetSession = () => {
    setTabs([]);
    setStaleData(null);
    localStorage.removeItem(storageKey);
  };

  return {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    staleData, // Dữ liệu cũ để hiển thị confirm
    isLoaded, // Cờ báo hiệu đã check cache xong
    restoreStaleSession, // Hàm khôi phục
    resetSession, // Hàm reset
  };
};
