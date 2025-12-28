/* eslint-disable react-refresh/only-export-components */
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TopicItem, VocabularyItem } from "@/types";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Book,
  BookOpen,
  Eraser,
  Eye,
  EyeOff,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { AddCardControl } from "./AddCardControl";
import VocabularyCard from "./VocabularyCard";

interface FlashcardSectionProps {
  allWords: VocabularyItem[];
  displayCards: VocabularyItem[];
  topics: TopicItem[];
  setDisplayCards: (vol: VocabularyItem[]) => void;
  onMarkLearned: (id: string, isLearned: boolean) => void;
  onUpdateWord: (id: string, updates: Partial<VocabularyItem>) => void;
  onDeleteWord: (id: string) => void;
  onAddWords: (newWords: VocabularyItem[]) => void;
}

export enum FlashcardCommandType {
  SHOW_MEANING_ALL = "SHOW_MEANING_ALL",
  HIDE_MEANING_ALL = "HIDE_MEANING_ALL",
  RESET_FLIP = "RESET_FLIP", // Face down
  FLIP_ALL = "FLIP_ALL", // Face up
}

export type FlashcardCommand = {
  type: FlashcardCommandType;
  timestamp: number;
};

const FlashcardSection: React.FC<FlashcardSectionProps> = ({
  allWords,
  displayCards,
  topics,
  setDisplayCards,
  onMarkLearned,
  onUpdateWord,
  onDeleteWord,
  onAddWords,
}) => {
  const [command, setCommand] = useState<FlashcardCommand | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  // State quản lý việc lật thẻ nằm ở đây (Source of Truth)
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());

  // --- Logic Command & Flip ---
  const sendCommand = (type: FlashcardCommandType) => {
    setCommand({ type, timestamp: Date.now() });

    // Cập nhật state flippedIds dựa trên command
    if (type === FlashcardCommandType.FLIP_ALL) {
      setFlippedIds(new Set(displayCards.map((card) => card.id)));
    } else if (type === FlashcardCommandType.RESET_FLIP) {
      setFlippedIds(new Set());
    }
  };

  const handleShuffle = () => {
    const shuffled = [...displayCards].sort(() => Math.random() - 0.5);
    setDisplayCards(shuffled);
    sendCommand(FlashcardCommandType.RESET_FLIP);
  };

  const confirmRemoveAll = () => {
    setDisplayCards([]);
    setFlippedIds(new Set());
    setIsDeleteAllOpen(false);
  };

  // Hàm này giờ đóng vai trò như setIsFlipped
  const handleCardFlipReport = (id: string, isFlipped: boolean) => {
    setFlippedIds((prev) => {
      const newSet = new Set(prev);
      if (isFlipped) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  };

  const removeFlippedCards = () => {
    if (flippedIds.size === 0) return;
    const remaining = displayCards.filter((card) => !flippedIds.has(card.id));
    setDisplayCards(remaining);
    setFlippedIds(new Set());
  };

  const sortFlippedCards = (direction: "top" | "bottom") => {
    const flipped = displayCards.filter((card) => flippedIds.has(card.id));
    const unflipped = displayCards.filter((card) => !flippedIds.has(card.id));
    setDisplayCards(
      direction === "top"
        ? [...flipped, ...unflipped]
        : [...unflipped, ...flipped]
    );
  };

  return (
    <div className="w-full h-full p-6 bg-muted/30 rounded-xl border-2 border-dashed border-border min-h-[600px] flex flex-col">
      {/* --- TOOLBAR (Giữ nguyên không đổi) --- */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          🔥 Flashcards
          <span className="bg-muted text-foreground text-sm py-0.5 px-2.5 rounded-full">
            {displayCards.length}
          </span>
        </h2>

        <div className="flex items-center gap-2">
          {/* 1. ADD NEW CARDS */}
          <AddCardControl
            allWords={allWords}
            displayCards={displayCards}
            topics={topics}
            onAdd={onAddWords}
          />

          <div className="w-[1px] h-6 bg-border mx-1"></div>

          {/* 2. CARD ROTATION GROUP */}
          <div className="bg-card border rounded-lg p-0.5 flex gap-0.5 shadow-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => sendCommand(FlashcardCommandType.FLIP_ALL)}
                    className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <BookOpen size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Flip All (Face Up)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => sendCommand(FlashcardCommandType.RESET_FLIP)}
                    className="h-8 w-8 text-foreground hover:bg-accent"
                  >
                    <Book size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Face Down All</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* 3. VISIBILITY GROUP */}
          <div className="bg-card border rounded-lg p-0.5 flex gap-0.5 shadow-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      sendCommand(FlashcardCommandType.SHOW_MEANING_ALL)
                    }
                    className="h-8 w-8 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                  >
                    <Eye size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reveal All Meanings</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      sendCommand(FlashcardCommandType.HIDE_MEANING_ALL)
                    }
                    className="h-8 w-8 text-muted-foreground hover:bg-accent"
                  >
                    <EyeOff size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hide All Meanings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* 4. SHUFFLE */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleShuffle}
                >
                  <RotateCcw size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Shuffle Cards</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 5. MORE ACTIONS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Flipped ({flippedIds.size})</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => sortFlippedCards("top")}>
                <ArrowUpToLine className="mr-2 h-4 w-4" /> Move flipped to top
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => sortFlippedCards("bottom")}>
                <ArrowDownToLine className="mr-2 h-4 w-4" /> Move flipped to
                bottom
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={removeFlippedCards}
                disabled={flippedIds.size === 0}
                className="text-red-600 focus:text-red-600"
              >
                <Eraser className="mr-2 h-4 w-4" /> Remove flipped cards
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 6. CLEAR ALL */}
          <Popover open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="font-medium leading-none text-red-600">
                    Clear study session?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    This will remove all cards from this view. Data is not
                    deleted from database.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteAllOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={confirmRemoveAll}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* --- GRID --- */}
      {displayCards.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <div className="text-6xl mb-4 grayscale opacity-50">🎉</div>
          <p className="text-lg font-medium">Study list is empty!</p>
          <div className="mt-4">
            <AddCardControl
              allWords={allWords}
              displayCards={displayCards}
              topics={topics}
              onAdd={onAddWords}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto flex flex-wrap gap-6 justify-center content-start pb-10">
          {displayCards.map((item) => (
            <VocabularyCard
              key={item.id}
              item={item}
              command={command}
              isFlipped={flippedIds.has(item.id)}
              onLearned={onMarkLearned}
              remove={(id) =>
                setDisplayCards(displayCards.filter((w) => w.id !== id))
              }
              onFlip={(newIsFlipped) =>
                handleCardFlipReport(item.id, newIsFlipped)
              } // [OUTPUT] Gọi hàm cập nhật state ở parent
              onUpdate={onUpdateWord}
              onDelete={onDeleteWord}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardSection;
