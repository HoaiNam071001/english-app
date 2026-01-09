import { GUEST_INFO, STORAGE_KEY } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { TabSession } from "@/types";
import moment from "moment";
import { useEffect, useRef, useState } from "react";

// Định nghĩa Type cho Storage
interface StoredTabSession {
  id: string;
  title: string;
  wordIds: string[];
  flippedIds: string[];
  meaningIds: string[];
  imageIds: string[];
}

interface StoredData {
  userId: string;
  activeTabId: string;
  tabs: StoredTabSession[];
}

export const useTabSession = () => {
  const { userProfile, isGuest } = useAuth();

  // Xử lý key dynamic theo user
  const [userId, setUserId] = useState<string>();
  const [storageKey, setStorageKey] = useState<string>();

  useEffect(() => {
    if (isGuest) {
      setUserId(GUEST_INFO.name); // Dùng name hoặc ID tùy const của bạn
      setStorageKey(`${STORAGE_KEY.CAR_TABS}_guest`);
    } else if (userProfile) {
      setUserId(userProfile.email);
      setStorageKey(`${STORAGE_KEY.CAR_TABS}_${userProfile.email}`);
    }
  }, [isGuest, userProfile]);

  const [tabs, setTabs] = useState<TabSession[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("tab-default");

  const [isLoaded, setIsLoaded] = useState(false);
  const isHydrated = useRef(false);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    setIsLoaded(false);
    isHydrated.current = false;
    // Nếu chưa xác định được user (lúc mới mount), chưa load
    if (!storageKey || !userId) return;

    const timer = setTimeout(() => {
      try {
        // [CHANGE] Dùng sessionStorage
        const rawData = sessionStorage.getItem(storageKey);

        if (rawData) {
          const parsed: StoredData = JSON.parse(rawData);

          // Validate User (Vẫn cần check để tránh load nhầm session nếu logic auth phức tạp)
          if (parsed.userId === userId) {
            const hydratedTabs: TabSession[] = parsed.tabs.map((t) => ({
              id: t.id,
              title: t.title,
              wordIds: t.wordIds || [],
              flippedIds: new Set(t.flippedIds),
              meaningIds: new Set(t.meaningIds),
              imageIds: new Set(t.imageIds),
            }));

            setTabs(hydratedTabs);
            setActiveTabId(parsed.activeTabId);
          } else {
            // Khác user -> Xóa cache
            sessionStorage.removeItem(storageKey);
          }
        }
      } catch (error) {
        console.error("Failed to load session:", error);
        sessionStorage.removeItem(storageKey);
      } finally {
        setIsLoaded(true);
        isHydrated.current = true;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [storageKey, userId, isGuest]);

  // --- 2. SAVE DATA ---
  useEffect(() => {
    if (!isHydrated.current || !storageKey || !userId) return;

    if (tabs?.length > 0) {
      const timer = setTimeout(() => {
        const tabsToStore: StoredTabSession[] = tabs.map((t) => ({
          id: t.id,
          title: t.title,
          wordIds: t.wordIds,
          flippedIds: Array.from(t.flippedIds || []),
          meaningIds: Array.from(t.meaningIds || []),
          imageIds: Array.from(t.imageIds || []),
        }));

        const dataToStore: StoredData = {
          // date: ..., // BỎ
          userId: userId,
          activeTabId: activeTabId,
          tabs: tabsToStore,
        };

        // [CHANGE] Dùng sessionStorage
        sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [tabs, activeTabId, userId, storageKey]);

  // --- ACTIONS ---

  const resetSession = () => {
    setTabs([]);
    if (storageKey) {
      sessionStorage.removeItem(storageKey);
    }
  };

  const generateNewTab = (
    index: number,
    wordIds: string[] = []
  ): TabSession => {
    return {
      id: `tab-${moment().valueOf()}`,
      title: `Session ${index}`,
      wordIds: wordIds,
      flippedIds: new Set(),
      meaningIds: new Set(),
      imageIds: new Set(),
    };
  };

  return {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    isLoaded,
    resetSession,
    generateNewTab,
  };
};
