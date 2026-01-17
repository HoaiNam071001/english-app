import { SimpleTooltip } from "@/components/SimpleTooltip";
import { Button } from "@/components/ui/button";
import { STORAGE_KEY } from "@/constants";
import { useConfirm } from "@/hooks/useConfirm";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useTabSession } from "@/hooks/useTabSession";
import { AddReport, TabSession, TopicItem, VocabularyItem } from "@/types";
import { isToday } from "@/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  LayoutList,
  List,
  PanelLeftClose,
  Plus,
  RotateCcw,
} from "lucide-react";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import CreateVocabularyModal from "../CreateVocabularyModal";
import FlashcardSection from "./FlashcardSection";
import { TabItem } from "./TabItem"; // Giả sử bạn đã tách file TabItem

export interface CardContainerRef {
  addWordsToSession: (words: VocabularyItem[]) => void;
  removeWordsToSession: (wordIds: string[]) => void;
}

interface CardContainerProps {
  allWords: VocabularyItem[];
  topics: TopicItem[];
  isLoaded: boolean;
  onActiveChanged: (mapping: Set<string>) => void;
  onMarkLearned: (id: string, isLearned: boolean) => void;
  onUpdateWord: (id: string, updates: Partial<VocabularyItem>) => void;
  onDeleteWord: (id: string) => void;
  handleAddVocabulary: (
    entries: Partial<VocabularyItem[]>,
  ) => Promise<AddReport>;
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
  onSidebarModalOpen?: () => void;
}

const CardContainer = forwardRef<CardContainerRef, CardContainerProps>(
  (
    {
      allWords,
      topics,
      isLoaded: allWordLoaded,
      handleAddVocabulary,
      onMarkLearned,
      onUpdateWord,
      onDeleteWord,
      onActiveChanged,
      onSidebarToggle,
      isSidebarOpen = true,
      onSidebarModalOpen,
    },
    ref,
  ) => {
    const {
      tabs,
      setTabs,
      activeTabId,
      setActiveTabId,
      isLoaded,
      resetSession,
      generateNewTab,
    } = useTabSession();
    const { getStorage, setStorage } = useLocalStorage();

    const [editingTabId, setEditingTabId] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(
      getStorage(STORAGE_KEY.MOBILE_HOME_COLLAPSE_ACTION) || false,
    );
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
      if (isCollapsed !== getStorage(STORAGE_KEY.MOBILE_HOME_COLLAPSE_ACTION)) {
        setStorage(STORAGE_KEY.MOBILE_HOME_COLLAPSE_ACTION, isCollapsed);
      }
    }, [isCollapsed]);

    // Optimization Map
    const wordMap = useMemo(() => {
      const map: Record<string, VocabularyItem> = {};
      allWords.forEach((word) => {
        map[word.id] = word;
      });
      return map;
    }, [allWords]);

    const { confirm } = useConfirm();

    // Hàm Init mặc định
    const initDefaultSession = () => {
      const todayWords = allWords.filter(
        (w) => isToday(w.createdAt) && !w.isLearned,
      );
      const newTab = generateNewTab(
        1,
        todayWords.map((w) => w.id),
      );
      setTabs([newTab]);
      setActiveTabId(newTab.id);
    };

    // 1. INITIALIZATION
    useEffect(() => {
      const checkAndInit = async () => {
        if (!isLoaded || !allWordLoaded) {
          hasInitialized.current = false;
          return;
        }

        // Nếu đã init rồi thì thôi
        if (hasInitialized.current) return;

        // Nếu tabs rỗng (không có cache hoặc cache bị xóa) -> Init mặc định
        if (tabs.length === 0) {
          initDefaultSession();
        }
        // Nếu tabs đã có (do useTabSession load được từ sessionStorage) -> Tự động dùng luôn, không cần làm gì thêm

        hasInitialized.current = true;
      };

      checkAndInit();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, allWords, allWordLoaded]);

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
      removeWordsToSession: (idsToRemove: string[]) => {
        if (!idsToRemove.length) return;

        setTabs((prevTabs) => {
          return prevTabs.map((tab) => {
            if (tab.id === activeTabId) {
              const idsSet = new Set(idsToRemove);

              const newWordIds = tab.wordIds.filter((id) => !idsSet.has(id));

              if (newWordIds.length === tab.wordIds.length) return tab;
              const newFlippedIds =
                tab.flippedIds?.values()?.filter((id) => !idsSet.has(id)) || [];
              const newMeaningIds =
                tab.meaningIds?.values()?.filter((id) => !idsSet.has(id)) || [];
              const newImageIds =
                tab.imageIds?.values()?.filter((id) => !idsSet.has(id)) || [];
              return {
                ...tab,
                wordIds: newWordIds,
                flippedIds: new Set(newFlippedIds),
                meaningIds: new Set(newMeaningIds),
                imageIds: new Set(newImageIds),
              };
            }
            return tab;
          });
        });
      },
    }));

    // 3. MANUAL RESET HANDLER (Vẫn giữ Confirm cho hành động phá hủy này)
    const handleManualReset = async () => {
      const isConfirmed = await confirm({
        title: "Start Fresh Session?",
        message:
          "This will close all current tabs and create a new session with today's unlearned words.",
        confirmText: "Start Fresh",
        cancelText: "Cancel",
        variant: "destructive",
      });

      if (isConfirmed) {
        resetSession();
        // Cần reset lại hasInitialized hoặc gọi trực tiếp init
        setTimeout(() => initDefaultSession(), 0);
      }
    };

    // --- Tab Handlers ---
    const handleAddTab = () => {
      const newId = `tab-${Date.now()}`;
      // [FIX] Sửa logic tạo tab mới dùng generateNewTab
      const newTab = generateNewTab(tabs.length + 1, []);
      newTab.id = newId; // Override ID nếu muốn chắc chắn unique theo time click

      setTabs((prev) => [...prev, newTab]);
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
          prev.map((t) => (t.id === id ? { ...t, title: trimmed } : t)),
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
        prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t)),
      );
    };

    // --- RENDER ---
    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

    useEffect(() => {
      onActiveChanged(new Set(activeTab?.wordIds || []));
    }, [activeTab]);

    const activeDisplayCards = useMemo(() => {
      return activeTab?.wordIds
        .map((id) => wordMap[id])
        .filter((w): w is VocabularyItem => !!w);
    }, [activeTab?.wordIds, wordMap]);

    // Loading State
    if (!isLoaded || !activeTab)
      return (
        <div className="h-full w-full flex items-center justify-center text-muted-foreground animate-pulse">
          Loading Session...
        </div>
      );

    return (
      <div className="flex flex-col h-full gap-0">
        {/* --- TOP ACTION BAR (Mobile only) --- */}
        <div className="flex items-center justify-between md:px-2 py-1.5 border-b bg-background/95 backdrop-blur shrink-0 md:hidden">
          <div className="flex items-center gap-1.5">
            {/* Sidebar Toggle Button - Mobile: List to open modal */}
            {onSidebarModalOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSidebarModalOpen}
                className="text-foreground h-8 w-8"
              >
                <List size={18} />
              </Button>
            )}
            {/* Collapse/Expand Toggle Button - Mobile only */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-foreground h-8 w-8"
            >
              <ChevronsUpDown size={18} />
            </Button>
          </div>
          <CreateVocabularyModal onAddVocabulary={handleAddVocabulary} />
        </div>

        {/* --- TAB BAR CONTAINER --- */}
        <div
          className={`flex items-center border-b bg-background/95 backdrop-blur gap-0.5 md:gap-1 h-[46px] z-10 shrink-0 ${isCollapsed ? "hidden md:flex" : ""}`}
        >
          {/* Sidebar Toggle Button - Desktop: Toggle sidebar (in tab bar) */}
          {onSidebarToggle && (
            <div className="hidden md:flex items-center px-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onSidebarToggle}
                className="text-foreground h-8 w-8"
              >
                {isSidebarOpen ? (
                  <PanelLeftClose size={18} />
                ) : (
                  <LayoutList size={18} />
                )}
              </Button>
            </div>
          )}
          {/* Scroll Left Button - Hide on mobile if not needed */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-muted-foreground hidden sm:flex"
            onClick={() => scrollTabs("left")}
          >
            <ChevronLeft size={16} />
          </Button>

          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-center overflow-x-auto scrollbar-hide items-end h-full gap-1.5 md:gap-2 min-w-0"
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

            <div className="sticky right-0 bg-background z-10 h-full flex items-center px-0.5">
              <SimpleTooltip content={"New Tab"}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddTab}
                  className="h-8 w-8 md:h-9 md:w-9 shrink-0 text-muted-foreground hover:text-foreground"
                  title="New Tab"
                >
                  <Plus size={16} className="md:w-[18px] md:h-[18px]" />
                </Button>
              </SimpleTooltip>
            </div>
          </div>

          {/* Scroll Right Button - Hide on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-muted-foreground hidden sm:flex"
            onClick={() => scrollTabs("right")}
          >
            <ChevronRight size={16} />
          </Button>

          {/* Action Buttons Group - Desktop: Reset + Add New Word */}
          <div className="hidden md:flex items-center gap-0.5 shrink-0 px-1">
            <SimpleTooltip content={"Reset"}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleManualReset}
                className="h-8 w-8 md:h-9 md:w-9 shrink-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                title="Reset Session"
              >
                <RotateCcw size={14} className="md:w-4 md:h-4" />
              </Button>
            </SimpleTooltip>
            <div className="w-[1px] h-4 md:h-5 bg-border mx-0.5 md:mx-1"></div>
            <CreateVocabularyModal onAddVocabulary={handleAddVocabulary} />
          </div>
          {/* Reset Button - Mobile only */}
          <div className="flex items-center shrink-0 px-1 md:hidden">
            <SimpleTooltip content={"Reset"}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleManualReset}
                className="h-8 w-8 shrink-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                title="Reset Session"
              >
                <RotateCcw size={14} className="md:w-4 md:h-4" />
              </Button>
            </SimpleTooltip>
          </div>
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
            imageIds={activeTab.imageIds}
            isToolbarCollapsed={isCollapsed}
            onFlippedIdsChange={(ids) =>
              updateActiveTabState({ flippedIds: ids })
            }
            onMeaningIdsChange={(ids) =>
              updateActiveTabState({ meaningIds: ids })
            }
            onImageIdsChange={(ids) => updateActiveTabState({ imageIds: ids })}
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
  },
);

CardContainer.displayName = "CardContainer";
export default CardContainer;
