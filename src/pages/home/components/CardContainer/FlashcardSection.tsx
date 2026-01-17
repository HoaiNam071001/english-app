/* eslint-disable react-refresh/only-export-components */
import { SimpleTooltip } from "@/components/SimpleTooltip";
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
import { useTopics } from "@/hooks/useTopics";
import { TopicItem, VocabularyItem } from "@/types";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Book,
  BookOpen,
  CheckCircle,
  Eraser,
  Eye,
  EyeOff,
  Image as ImageIcon, // [NEW] Alias để tránh trùng tên
  ImageOff, // [NEW]
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { AddCardControl } from "./AddCardControl";
import VocabularyCard from "./VocabularyCard";

export interface FlashcardSectionProps {
  allWords: VocabularyItem[];
  displayCards: VocabularyItem[];
  topics: TopicItem[];
  flippedIds: Set<string>;
  meaningIds: Set<string>;
  imageIds: Set<string>;
  onImageIdsChange: (ids: Set<string>) => void;
  onFlippedIdsChange: (ids: Set<string>) => void;
  onMeaningIdsChange: (ids: Set<string>) => void;
  setDisplayCards: (vol: VocabularyItem[]) => void;
  onMarkLearned: (id: string, isLearned: boolean) => void;
  onUpdateWord: (id: string, updates: Partial<VocabularyItem>) => void;
  onDeleteWord: (id: string) => void;
  onAddWords: (newWords: VocabularyItem[]) => void;
  isToolbarCollapsed?: boolean;
}

export enum FlashcardCommandType {
  SHOW_MEANING_ALL = "SHOW_MEANING_ALL",
  HIDE_MEANING_ALL = "HIDE_MEANING_ALL",
  SHOW_IMAGE_ALL = "SHOW_IMAGE_ALL", // [NEW]
  HIDE_IMAGE_ALL = "HIDE_IMAGE_ALL", // [NEW]
  RESET_FLIP = "RESET_FLIP",
  FLIP_ALL = "FLIP_ALL",
}

export type FlashcardCommand = {
  type: FlashcardCommandType;
  timestamp: number;
};

const FlashcardSection: React.FC<FlashcardSectionProps> = ({
  allWords,
  displayCards,
  flippedIds,
  meaningIds,
  imageIds,
  onImageIdsChange,
  onFlippedIdsChange,
  onMeaningIdsChange,
  setDisplayCards,
  onMarkLearned,
  onUpdateWord,
  onDeleteWord,
  onAddWords,
  isToolbarCollapsed = false,
}) => {
  const [command, setCommand] = useState<FlashcardCommand | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const { topics } = useTopics();

  // --- Logic Command ---
  const sendCommand = (type: FlashcardCommandType) => {
    setCommand({ type, timestamp: Date.now() });

    if (type === FlashcardCommandType.FLIP_ALL) {
      onFlippedIdsChange(new Set(displayCards.map((card) => card.id)));
    } else if (type === FlashcardCommandType.RESET_FLIP) {
      onFlippedIdsChange(new Set());
      onMeaningIdsChange(new Set());
      onImageIdsChange(new Set()); // [UPDATED] Reset images too
    } else if (type === FlashcardCommandType.SHOW_MEANING_ALL) {
      onMeaningIdsChange(new Set(displayCards.map((card) => card.id)));
    } else if (type === FlashcardCommandType.HIDE_MEANING_ALL) {
      onMeaningIdsChange(new Set());
    } 
    else if (type === FlashcardCommandType.SHOW_IMAGE_ALL) {
      onImageIdsChange(new Set());
    } else if (type === FlashcardCommandType.HIDE_IMAGE_ALL) {
      onImageIdsChange(new Set(displayCards.map((card) => card.id)));
    }
  };

  const handleShuffle = () => {
    const shuffled = [...displayCards].sort(() => Math.random() - 0.5);
    setDisplayCards(shuffled);
    onFlippedIdsChange(new Set());
  };

  const confirmRemoveAll = () => {
    setDisplayCards([]);
    onFlippedIdsChange(new Set());
    onMeaningIdsChange(new Set());
    onImageIdsChange(new Set());
    setIsDeleteAllOpen(false);
  };

  const handleCardFlipReport = (id: string, isFlipped: boolean) => {
    const newSet = new Set(flippedIds);
    if (isFlipped) newSet.add(id);
    else newSet.delete(id);
    onFlippedIdsChange(newSet);
  };

  const handleShowMeaningReport = (id: string, isShowing: boolean) => {
    const newSet = new Set(meaningIds);
    if (isShowing) newSet.add(id);
    else newSet.delete(id);
    onMeaningIdsChange(newSet);
  };

  const handleShowImageReport = (id: string, isShowing: boolean) => {
    const newSet = new Set(imageIds);
    if (isShowing) newSet.add(id);
    else newSet.delete(id);
    onImageIdsChange(newSet);
  };

  const removeFlippedCards = () => {
    if (flippedIds.size === 0) return;
    const remaining = displayCards.filter((card) => !flippedIds.has(card.id));
    setDisplayCards(remaining);
    const newFlippedIds = new Set<string>();
    const newMeaningIds = new Set(meaningIds);
    const newImageIds = new Set(imageIds);

    displayCards.forEach((card) => {
      if (flippedIds.has(card.id)) {
        newMeaningIds.delete(card.id);
        newImageIds.delete(card.id);
      }
    });
    onFlippedIdsChange(newFlippedIds);
    onMeaningIdsChange(newMeaningIds);
    onImageIdsChange(newImageIds);
  };

  const removeLearnedCards = () => {
    const remaining = displayCards.filter((card) => !card.isLearned);
    if (remaining.length === displayCards.length) return;

    setDisplayCards(remaining);

    const newFlippedIds = new Set(flippedIds);
    const newMeaningIds = new Set(meaningIds);
    const newImageIds = new Set(imageIds);

    displayCards.forEach((card) => {
      if (card.isLearned) {
        newFlippedIds.delete(card.id);
        newMeaningIds.delete(card.id);
        newImageIds.delete(card.id);
      }
    });

    onFlippedIdsChange(newFlippedIds);
    onMeaningIdsChange(newMeaningIds);
    onImageIdsChange(newImageIds);
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

  const hasLearnedCards = displayCards.some((c) => c.isLearned);

  // --- RENDER ---
  return (
    <div className="w-full h-full flex flex-col bg-muted/10 overflow-hidden">
      {/* Toolbar */}
      <div className={`flex items-center justify-between gap-1.5 px-2 py-2 border-b bg-background/80 backdrop-blur-sm shrink-0 overflow-x-auto ${isToolbarCollapsed ? "hidden md:flex" : ""}`}>
        {/* Left: Cards count & Add control */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 shrink-0">
          <div className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:inline">CARDS</span>
            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-bold">
              {displayCards.length}
            </span>
          </div>
          <div className="h-4 w-[1px] bg-border mx-0.5 hidden sm:block shrink-0"></div>
          <div className="min-w-0 shrink">
            <AddCardControl
              allWords={allWords}
              displayCards={displayCards}
              topics={topics}
              onAdd={onAddWords}
            />
          </div>
        </div>

        {/* Right: Actions - Mobile: Grouped in dropdown, Desktop: Individual buttons */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Mobile: Flip actions - inline */}
          <div className="flex items-center bg-muted/50 rounded-md p-0.5 border sm:hidden shrink-0">
            <SimpleTooltip content={"Flip All Up"}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => sendCommand(FlashcardCommandType.FLIP_ALL)}
                className="h-7 w-7 text-blue-600 dark:text-blue-400 hover:bg-background"
                title="Flip All Up"
              >
                <BookOpen size={14} />
              </Button>
            </SimpleTooltip>
            <div className="w-[1px] h-4 bg-border/50 mx-0.5"></div>
            <SimpleTooltip content={"Flip All Down"}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => sendCommand(FlashcardCommandType.RESET_FLIP)}
                className="h-7 w-7 text-muted-foreground hover:bg-background"
                title="Flip All Down"
              >
                <Book size={14} />
              </Button>
            </SimpleTooltip>
          </div>

          {/* Desktop: Individual flip group */}
          <div className="hidden sm:flex items-center bg-muted/50 rounded-md p-0.5 border shrink-0">
            <SimpleTooltip content={"Flip All Up"}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => sendCommand(FlashcardCommandType.FLIP_ALL)}
                className="h-7 w-7 text-blue-600 dark:text-blue-400 hover:bg-background"
                title="Flip All Up"
              >
                <BookOpen size={14} />
              </Button>
            </SimpleTooltip>
            <div className="w-[1px] h-4 bg-border/50 mx-0.5"></div>
            <SimpleTooltip content={"Flip All Down"}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => sendCommand(FlashcardCommandType.RESET_FLIP)}
                className="h-7 w-7 text-muted-foreground hover:bg-background"
                title="Flip All Down"
              >
                <Book size={14} />
              </Button>
            </SimpleTooltip>
          </div>

          {/* 2. Group: Meaning - Desktop only */}
          <div className="hidden sm:flex items-center bg-muted/50 rounded-md p-0.5 border ml-0.5 shrink-0">
            <SimpleTooltip content={"Show All Meanings"}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  sendCommand(FlashcardCommandType.SHOW_MEANING_ALL)
                }
                className="h-7 w-7 text-indigo-600 dark:text-indigo-400 hover:bg-background"
                title="Show All Meanings"
              >
                <Eye size={14} />
              </Button>
            </SimpleTooltip>
            <div className="w-[1px] h-4 bg-border/50 mx-0.5"></div>
            <SimpleTooltip content={"Hide All Meanings"}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  sendCommand(FlashcardCommandType.HIDE_MEANING_ALL)
                }
                className="h-7 w-7 text-muted-foreground hover:bg-background"
                title="Hide All Meanings"
              >
                <EyeOff size={14} />
              </Button>
            </SimpleTooltip>
          </div>

          {/* 3. Group: Image - Desktop only */}
          <div className="hidden sm:flex items-center bg-muted/50 rounded-md p-0.5 border ml-0.5 shrink-0">
            <SimpleTooltip content={"Show All Images"}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => sendCommand(FlashcardCommandType.SHOW_IMAGE_ALL)}
                className="h-7 w-7 text-orange-600 dark:text-orange-400 hover:bg-background"
                title="Show All Images"
              >
                <ImageIcon size={14} />
              </Button>
            </SimpleTooltip>
            <div className="w-[1px] h-4 bg-border/50 mx-0.5"></div>
            <SimpleTooltip content={"Hide All Images"}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => sendCommand(FlashcardCommandType.HIDE_IMAGE_ALL)}
                className="h-7 w-7 text-muted-foreground hover:bg-background"
                title="Hide All Images"
              >
                <ImageOff size={14} />
              </Button>
            </SimpleTooltip>
          </div>

          <div className="w-[1px] h-4 bg-border mx-0.5 hidden sm:block shrink-0"></div>

          {/* Mobile: More Actions Menu (groups Meaning, Image, Shuffle, etc.) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground sm:hidden shrink-0"
              >
                <MoreHorizontal size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => sendCommand(FlashcardCommandType.SHOW_MEANING_ALL)}
              >
                <Eye className="mr-2 h-3.5 w-3.5" /> Show All Meanings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => sendCommand(FlashcardCommandType.HIDE_MEANING_ALL)}
              >
                <EyeOff className="mr-2 h-3.5 w-3.5" /> Hide All Meanings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => sendCommand(FlashcardCommandType.SHOW_IMAGE_ALL)}
              >
                <ImageIcon className="mr-2 h-3.5 w-3.5" /> Show All Images
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => sendCommand(FlashcardCommandType.HIDE_IMAGE_ALL)}
              >
                <ImageOff className="mr-2 h-3.5 w-3.5" /> Hide All Images
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleShuffle}>
                <RotateCcw className="mr-2 h-3.5 w-3.5" /> Shuffle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={removeLearnedCards}
                disabled={!hasLearnedCards}
              >
                <CheckCircle className="mr-2 h-3.5 w-3.5" /> Remove Learned
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">
                Flipped Cards ({flippedIds.size})
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => sortFlippedCards("top")}>
                <ArrowUpToLine className="mr-2 h-3.5 w-3.5" /> Move to top
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => sortFlippedCards("bottom")}>
                <ArrowDownToLine className="mr-2 h-3.5 w-3.5" /> Move to bottom
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={removeFlippedCards}
                disabled={flippedIds.size === 0}
                className="text-red-600 focus:text-red-600"
              >
                <Eraser className="mr-2 h-3.5 w-3.5" /> Remove flipped
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop: Individual action buttons */}
          {/* Shuffle - Desktop only */}
          <SimpleTooltip content={"Shuffle"}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex shrink-0"
              onClick={handleShuffle}
              title="Shuffle"
            >
              <RotateCcw size={15} />
            </Button>
          </SimpleTooltip>

          {/* Remove Learned - Desktop only */}
          <SimpleTooltip content={"Remove learned"}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex shrink-0"
              onClick={removeLearnedCards}
              disabled={!hasLearnedCards}
              title="Remove Learned"
            >
              <CheckCircle size={15} />
            </Button>
          </SimpleTooltip>

          {/* More Menu - Desktop only (for flipped cards) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex shrink-0"
              >
                <MoreHorizontal size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs">
                Flipped Cards ({flippedIds.size})
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => sortFlippedCards("top")}>
                <ArrowUpToLine className="mr-2 h-3.5 w-3.5" /> Move to top
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => sortFlippedCards("bottom")}>
                <ArrowDownToLine className="mr-2 h-3.5 w-3.5" /> Move to bottom
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={removeFlippedCards}
                disabled={flippedIds.size === 0}
                className="text-red-600 focus:text-red-600"
              >
                <Eraser className="mr-2 h-3.5 w-3.5" /> Remove flipped
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete All Popover - Always visible */}
          <Popover open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
            <SimpleTooltip content={"Clear Session"}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                  title="Clear Session"
                >
                  <Trash2 size={15} />
                </Button>
              </PopoverTrigger>
            </SimpleTooltip>

            <PopoverContent className="w-64 p-3" align="end">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-destructive">
                  Clear this session?
                </h4>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setIsDeleteAllOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 text-xs"
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

      {/* --- GRID SCROLL AREA --- */}
      {displayCards.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <div className="text-4xl mb-2 grayscale opacity-30">📇</div>
          <p className="text-sm font-medium">No cards in session</p>
          <div className="mt-3">
            <AddCardControl
              allWords={allWords}
              displayCards={displayCards}
              topics={topics}
              onAdd={onAddWords}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          <div className="flex flex-wrap gap-3 justify-center content-start pb-8">
            {displayCards.map((item) => (
              <VocabularyCard
                key={item.id}
                item={item}
                topics={topics}
                command={command}
                isFlipped={flippedIds.has(item.id)}
                showMeaning={meaningIds.has(item.id)}
                hideImage={imageIds.has(item.id)} 
                onLearned={onMarkLearned}
                remove={(id) => {
                  const newDisplay = displayCards.filter((w) => w.id !== id);
                  setDisplayCards(newDisplay);
                  const newFlipped = new Set(flippedIds);
                  newFlipped.delete(id);
                  onFlippedIdsChange(newFlipped);
                  const newMeaning = new Set(meaningIds);
                  newMeaning.delete(id);
                  onMeaningIdsChange(newMeaning);
                  const newImage = new Set(imageIds);
                  newImage.delete(id);
                  onImageIdsChange(newImage);
                }}
                onFlip={(val) => handleCardFlipReport(item.id, val)}
                onToggleMeaning={(val) => handleShowMeaningReport(item.id, val)}
                onToggleImage={(val) => handleShowImageReport(item.id, val)} // [UPDATED]
                onUpdate={onUpdateWord}
                onDelete={onDeleteWord}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardSection;