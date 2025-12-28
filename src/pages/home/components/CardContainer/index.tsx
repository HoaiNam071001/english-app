import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TopicItem, VocabularyItem } from "@/types";
import { isToday } from "@/utils";
import { Check, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import FlashcardSection from "./FlashcardSection";

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

interface TabSession {
  id: string;
  title: string;
  wordIds: string[];
  flippedIds: Set<string>;
  meaningIds: Set<string>;
}

// --- Component con: TabItem với Popover Edit ---
interface TabItemProps {
  tab: TabSession;
  isActive: boolean;
  isEditing: boolean;
  disableClose: boolean;
  onActivate: () => void;
  onClose: (e: React.MouseEvent) => void;
  onEditStart: () => void;
  onEditSave: (newTitle: string) => void;
  onEditCancel: () => void;
}

const TabItem = ({
  tab,
  isActive,
  isEditing,
  disableClose,
  onActivate,
  onClose,
  onEditStart,
  onEditSave,
  onEditCancel,
}: TabItemProps) => {
  const [tempTitle, setTempTitle] = useState(tab.title);

  // Reset tempTitle khi tab title thay đổi hoặc khi bắt đầu edit
  useEffect(() => {
    setTempTitle(tab.title);
  }, [tab.title, isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEditSave(tempTitle);
    }
  };

  return (
    <div
      onClick={onActivate}
      className={`
        group flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg cursor-pointer border-t border-x transition-all select-none min-w-[120px] max-w-[200px] shrink-0
        ${
          isActive
            ? "bg-muted/30 border-border text-foreground relative -mb-[1px] border-b-transparent z-10 shadow-sm"
            : "bg-transparent border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        }
      `}
    >
      {/* Popover Edit Title */}
      <Popover
        open={isEditing}
        onOpenChange={(isOpen) => {
          if (!isOpen) onEditCancel();
        }}
      >
        <PopoverTrigger asChild>
          <span
            className="truncate flex-1"
            onDoubleClick={(e) => {
              e.stopPropagation();
              onEditStart();
            }}
            title="Double click to rename"
          >
            {tab.title}
          </span>
        </PopoverTrigger>

        <PopoverContent className="w-64 p-2" align="start" sideOffset={-10}>
          <div className="flex items-center gap-2">
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8 text-sm"
              placeholder="Session name"
              autoFocus
            />
            <Button
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onEditSave(tempTitle)}
            >
              <Check size={14} />
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Count Badge */}
      <span className="text-[10px] bg-muted-foreground/10 px-1.5 rounded-full min-w-[1.5rem] text-center flex-shrink-0">
        {tab.wordIds.length}
      </span>

      {/* Close Button */}
      {!disableClose && (
        <div
          onClick={onClose}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all flex-shrink-0"
        >
          <X size={12} />
        </div>
      )}
    </div>
  );
};

// --- Component chính ---
const CardContainer = forwardRef<CardContainerRef, CardContainerProps>(
  ({ allWords, topics, onMarkLearned, onUpdateWord, onDeleteWord }, ref) => {
    const [tabs, setTabs] = useState<TabSession[]>([
      {
        id: "tab-default",
        title: "Session 1",
        wordIds: [],
        flippedIds: new Set(),
        meaningIds: new Set(),
      },
    ]);
    const [activeTabId, setActiveTabId] = useState<string>("tab-default");
    const [editingTabId, setEditingTabId] = useState<string | null>(null);

    const hasInitialized = useRef(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // --- 1. INITIALIZATION ---
    useEffect(() => {
      if (!hasInitialized.current && allWords.length > 0) {
        const todayWords = allWords.filter(
          (w) => isToday(w.createdAt) && !w.isLearned
        );
        setTabs((prev) =>
          prev.map((t) =>
            t.id === "tab-default"
              ? { ...t, wordIds: todayWords.map((w) => w.id) }
              : t
          )
        );
        hasInitialized.current = true;
      }
    }, [allWords]);

    // --- 2. SYNC LOGIC ---
    useEffect(() => {
      setTabs((prevTabs) => {
        return prevTabs.map((tab) => {
          const validIds = tab.wordIds.filter((id) =>
            allWords.some((w) => w.id === id)
          );
          if (validIds.length !== tab.wordIds.length) {
            return { ...tab, wordIds: validIds };
          }
          return tab;
        });
      });
    }, [allWords]);

    // --- 3. EXPOSE METHOD ---
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

    // --- HANDLERS ---
    const handleAddTab = () => {
      const newId = `tab-${Date.now()}`;
      setTabs([
        ...tabs,
        {
          id: newId,
          title: `Session ${tabs.length + 1}`,
          wordIds: [],
          flippedIds: new Set(),
          meaningIds: new Set(),
        },
      ]);
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
    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
    const activeDisplayCards = activeTab.wordIds
      .map((id) => allWords.find((w) => w.id === id))
      .filter((w): w is VocabularyItem => !!w);

    return (
      <div className="flex flex-col h-full gap-2">
        {/* --- TAB BAR CONTAINER --- */}
        <div className="flex items-center border-b px-2 bg-background/95 backdrop-blur sticky top-0 z-10 gap-1 h-[46px]">
          {/* Left Scroll */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-muted-foreground"
            onClick={() => scrollTabs("left")}
          >
            <ChevronLeft size={16} />
          </Button>

          {/* Tab List Scrollable Area */}
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

          {/* Separator */}
          <div className="w-[1px] h-5 bg-border mx-1"></div>

          {/* Fixed Add Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddTab}
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
            title="New Session"
          >
            <Plus size={18} />
          </Button>
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
