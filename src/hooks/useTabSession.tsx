import { GUEST_INFO, STORAGE_KEY } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { TabSession } from "@/types";
import moment from "moment"; // Cần cài: npm install moment
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

export const getTodayString = () => moment().format("YYYY-MM-DD");

export const useTabSession = () => {
  const { userProfile, isGuest } = useAuth();
  const userId = isGuest ? GUEST_INFO.name : userProfile?.email || "unknown";
  const storageKey = `${STORAGE_KEY.CAR_TABS}_${userId}`; // Thêm dấu _ cho dễ nhìn

  const [tabs, setTabs] = useState<TabSession[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("tab-default");

  // State chứa dữ liệu cũ nếu khác ngày
  const [staleData, setStaleData] = useState<{
    tabs: TabSession[];
    activeTabId: string;
  } | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const isHydrated = useRef(false);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    setIsLoaded(false);
    isHydrated.current = false;
    setStaleData(null);

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
              setTabs(hydratedTabs);
              setActiveTabId(parsed.activeTabId);
            } else {
              setStaleData({
                tabs: hydratedTabs,
                activeTabId: parsed.activeTabId,
              });
            }
          } else {
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

  // --- 2. SAVE DATA ---
  useEffect(() => {
    if (!isHydrated.current) return;

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
  const restoreStaleSession = () => {
    if (staleData) {
      setTabs(staleData.tabs);
      setActiveTabId(staleData.activeTabId);
      setStaleData(null);
    }
  };

  const resetSession = () => {
    setTabs([]);
    setStaleData(null);
    localStorage.removeItem(storageKey);
  };

  const generateNewTab = (
    index: number,
    wordIds: string[] = []
  ): TabSession => {
    return {
      id: `tab-${moment().valueOf()}`, // ID theo timestamp
      title: `Tab ${index}`, // Tên theo số thứ tự
      wordIds: wordIds,
      flippedIds: new Set(),
      meaningIds: new Set(),
    };
  };

  return {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    staleData,
    isLoaded,
    restoreStaleSession,
    resetSession,
    generateNewTab,
  };
};
