import { SimpleTooltip } from "@/components/SimpleTooltip";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/useConfirm"; // Giả sử path hook confirm của bạn
import { useTabSession } from "@/hooks/useTabSession";
import { TabSession, TopicItem, VocabularyItem } from "@/types";
import { isToday } from "@/utils";
import { ChevronLeft, ChevronRight, Plus, RotateCcw } from "lucide-react";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import FlashcardSection from "./FlashcardSection";
import { TabItem } from "./TabItem";

export interface CardContainerRef {
  addWordsToSession: (words: VocabularyItem[]) => void;
}

interface CardContainerProps {
  allWords: VocabularyItem[];
  topics: TopicItem[];
  onMarkLearned: (id: string, isLearned: boolean) => void;
  onUpdateWord: (id: string, updates: Partial<VocabularyItem>) => void;
  onDeleteWord: (id: string) => void;
}

const CardContainer = forwardRef<CardContainerRef, CardContainerProps>(
  ({ allWords, topics, onMarkLearned, onUpdateWord, onDeleteWord }, ref) => {
    const {
      tabs,
      setTabs,
      activeTabId,
      setActiveTabId,
      staleData,
      isLoaded,
      restoreStaleSession,
      resetSession,
      generateNewTab,
    } = useTabSession();

    const [editingTabId, setEditingTabId] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);
    const wordMap = useMemo(() => {
      const map: Record<string, VocabularyItem> = {};
      allWords.forEach((word) => {
        map[word.id] = word;
      });
      return map;
    }, [allWords]);

    const { confirm } = useConfirm();

    // Hàm tạo session mặc định (tách ra để dùng cho Init và Reset Button)
    const initDefaultSession = () => {
      const todayWords = allWords.filter(
        (w) => isToday(w.createdAt) && !w.isLearned
      );
      const newTab = generateNewTab(
        1,
        todayWords.map((w) => w.id)
      );
      setTabs([newTab]);
      setActiveTabId(newTab.id);
    };

    // 1. INITIALIZATION & STALE CHECK
    useEffect(() => {
      const checkAndInit = async () => {
        // Chỉ chạy khi đã load cache xong và có allWords
        if (!isLoaded || allWords.length === 0) return;
        if (hasInitialized.current) return;

        // A. Nếu có Stale Data (khác ngày) -> Hỏi User
        if (staleData) {
          const isConfirmed = await confirm({
            title: "Restore Previous Session?",
            message: `We found a session from ${staleData.tabs.length} tabs from a previous day. Do you want to continue where you left off?`,
            confirmText: "Restore Session",
            cancelText: "Start New Day",
            variant: "default",
          });

          if (isConfirmed) {
            restoreStaleSession();
          } else {
            // Cancel -> Reset -> Init Default
            resetSession();
            initDefaultSession();
          }
        }
        // B. Nếu không có Tabs nào (Mới tinh hoặc đã clear cache) -> Init Default
        else if (tabs.length === 0) {
          initDefaultSession();
        }

        hasInitialized.current = true;
      };

      checkAndInit();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, allWords.length, staleData]); // Chạy lại khi staleData thay đổi

    // 2. EXPOSE METHODS
    useImperativeHandle(ref, () => ({
      addWordsToSession: (newWords: VocabularyItem[]) => {
        setTabs((prevTabs) => {
          return prevTabs.map((tab) => {
            if (tab.id === activeTabId) {
              const currentIds = new Set(tab.wordIds);
              const wordsToAdd = newWords.filter((w) => !currentIds.has(w.id));
              if (wordsToAdd.length === 0) return tab;
              return {
                ...tab,
                wordIds: [...wordsToAdd.map((w) => w.id), ...tab.wordIds],
              };
            }
            return tab;
          });
        });
      },
    }));

    // 3. MANUAL RESET HANDLER
    const handleManualReset = async () => {
      const isConfirmed = await confirm({
        title: "Start Fresh Session?",
        message:
          "This will close all current tabs and create a new session with today's unlearned words. Unsaved progress in tabs will be lost.",
        confirmText: "Start Fresh",
        cancelText: "Cancel",
        variant: "destructive",
      });

      if (isConfirmed) {
        resetSession(); // Xóa cache & state
        setTimeout(() => initDefaultSession(), 0); // Init lại cái mới
      }
    };

    // --- Tab Handlers ---
    const handleAddTab = () => {
      const newId = `tab-${Date.now()}`;
      setTabs((prev) => [...prev, generateNewTab(prev.length + 1, [])]);
      setActiveTabId(newId);
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            left: scrollContainerRef.current.scrollWidth,
            behavior: "smooth",
          });
        }
      }, 100);
    };

    const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
      e.stopPropagation();
      if (tabs.length === 1) return;
      const newTabs = tabs.filter((t) => t.id !== tabId);
      setTabs(newTabs);
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
    };

    const handleRename = (id: string, newTitle: string) => {
      const trimmed = newTitle.trim();
      if (trimmed) {
        setTabs((prev) =>
          prev.map((t) => (t.id === id ? { ...t, title: trimmed } : t))
        );
      }
      setEditingTabId(null);
    };

    const scrollTabs = (direction: "left" | "right") => {
      if (scrollContainerRef.current) {
        const amount = 200;
        scrollContainerRef.current.scrollBy({
          left: direction === "left" ? -amount : amount,
          behavior: "smooth",
        });
      }
    };

    const updateActiveTabState = (updates: Partial<TabSession>) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t))
      );
    };

    // --- RENDER ---
    // Kiểm tra activeTab an toàn
    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

    // Nếu đang load cache hoặc chưa có tab nào (đang init) -> Render Loading hoặc Null
    if (!isLoaded || !activeTab)
      return (
        <div className="h-full w-full flex items-center justify-center text-muted-foreground animate-pulse">
          Loading Session...
        </div>
      );

    const activeDisplayCards = activeTab.wordIds
      .map((id) => wordMap[id])
      .filter((w): w is VocabularyItem => !!w);

    return (
      <div className="flex flex-col h-full gap-2">
        {/* --- TAB BAR CONTAINER --- */}
        <div className="flex items-center border-b px-2 bg-background/95 backdrop-blur gap-1 h-[46px] z-10">
          {/* Left Scroll */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-muted-foreground"
            onClick={() => scrollTabs("left")}
          >
            <ChevronLeft size={16} />
          </Button>

          {/* Scrollable Tabs */}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex overflow-x-auto scrollbar-hide items-end h-full gap-2 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {tabs.map((tab) => (
              <TabItem
                key={tab.id}
                tab={tab}
                isActive={activeTabId === tab.id}
                isEditing={editingTabId === tab.id}
                disableClose={tabs.length === 1}
                onActivate={() => setActiveTabId(tab.id)}
                onClose={(e) => handleCloseTab(e, tab.id)}
                onEditStart={() => setEditingTabId(tab.id)}
                onEditSave={(val) => handleRename(tab.id, val)}
                onEditCancel={() => setEditingTabId(null)}
              />
            ))}
          </div>

          {/* Right Scroll */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-muted-foreground"
            onClick={() => scrollTabs("right")}
          >
            <ChevronRight size={16} />
          </Button>

          <div className="w-[1px] h-5 bg-border mx-1"></div>

          {/* [NEW] Reset Button */}
          <SimpleTooltip content={"Reset"}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleManualReset}
              className="h-9 w-9 shrink-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
              title="Start New Day (Reset)"
            >
              <RotateCcw size={16} />
            </Button>
          </SimpleTooltip>

          {/* Add Button */}
          <SimpleTooltip content={"New Tab"}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddTab}
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
              title="New Tab"
            >
              <Plus size={18} />
            </Button>
          </SimpleTooltip>
        </div>

        {/* --- CONTENT --- */}
        <div className="flex-1 relative min-h-0 bg-muted/10">
          <FlashcardSection
            key={activeTabId}
            allWords={allWords}
            topics={topics}
            displayCards={activeDisplayCards}
            flippedIds={activeTab.flippedIds}
            meaningIds={activeTab.meaningIds}
            onFlippedIdsChange={(ids) =>
              updateActiveTabState({ flippedIds: ids })
            }
            onMeaningIdsChange={(ids) =>
              updateActiveTabState({ meaningIds: ids })
            }
            setDisplayCards={(items) =>
              updateActiveTabState({ wordIds: items.map((i) => i.id) })
            }
            onMarkLearned={onMarkLearned}
            onUpdateWord={onUpdateWord}
            onDeleteWord={onDeleteWord}
            onAddWords={(words) => {
              const currentIds = new Set(activeTab.wordIds);
              const wordsToAdd = words.filter((w) => !currentIds.has(w.id));
              if (wordsToAdd.length > 0) {
                updateActiveTabState({
                  wordIds: [
                    ...wordsToAdd.map((w) => w.id),
                    ...activeTab.wordIds,
                  ],
                });
              }
            }}
          />
        </div>
      </div>
    );
  }
);

CardContainer.displayName = "CardContainer";
export default CardContainer;
