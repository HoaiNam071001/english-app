import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // <--- Import Dropdown
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
import { VocabularyItem } from "@/types";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Eraser,
  Eye,
  EyeOff,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import VocabularyCard from "./VocabularyCard";

interface FlashcardSectionProps {
  displayCards: VocabularyItem[];
  setDisplayCards: (vol: VocabularyItem[]) => void;
  onMarkLearned: (id: string) => void;
  onUpdateWord: (id: string, updates: Partial<VocabularyItem>) => void;
  onDeleteWord: (id: string) => void;
}

export type FlashcardCommand = {
  type: "SHOW_MEANING_ALL" | "HIDE_MEANING_ALL" | "RESET_FLIP";
  timestamp: number;
};

const FlashcardSection: React.FC<FlashcardSectionProps> = ({
  displayCards,
  setDisplayCards,
  onMarkLearned,
  onUpdateWord,
  onDeleteWord,
}) => {
  const [command, setCommand] = useState<FlashcardCommand | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  // 1. State theo dõi các thẻ đang lật
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());

  const sendCommand = (type: FlashcardCommand["type"]) => {
    setCommand({ type, timestamp: Date.now() });

    // Nếu reset hoặc hide all -> Xóa danh sách đang lật
    if (type === "RESET_FLIP") {
      setFlippedIds(new Set());
    }
  };

  const handleShuffle = () => {
    const shuffled = [...displayCards].sort(() => Math.random() - 0.5);
    setDisplayCards(shuffled);
    sendCommand("RESET_FLIP");
  };

  const confirmRemoveAll = () => {
    setDisplayCards([]);
    setFlippedIds(new Set());
    setIsDeleteAllOpen(false);
  };

  // 2. Hàm xử lý khi Card con báo cáo trạng thái lật
  const handleCardFlipReport = (id: string, isFlipped: boolean) => {
    setFlippedIds((prev) => {
      const newSet = new Set(prev);
      if (isFlipped) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  };

  // 3. Tính năng: Xóa các thẻ đã lật
  const removeFlippedCards = () => {
    if (flippedIds.size === 0) return;
    const remaining = displayCards.filter((card) => !flippedIds.has(card.id));
    setDisplayCards(remaining);
    setFlippedIds(new Set()); // Reset vì các thẻ lật đã bị xóa
  };

  // 4. Tính năng: Sắp xếp thẻ lật (Lên đầu hoặc Xuống cuối)
  const sortFlippedCards = (direction: "top" | "bottom") => {
    const flipped = displayCards.filter((card) => flippedIds.has(card.id));
    const unflipped = displayCards.filter((card) => !flippedIds.has(card.id));

    if (direction === "top") {
      setDisplayCards([...flipped, ...unflipped]);
    } else {
      setDisplayCards([...unflipped, ...flipped]);
    }
  };

  return (
    <div className="w-full h-full p-6 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 min-h-[600px] flex flex-col">
      {/* --- TOOLBAR --- */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          🔥 Flashcards
          <span className="bg-slate-200 text-slate-700 text-sm py-0.5 px-2.5 rounded-full">
            {displayCards.length}
          </span>
        </h2>

        <div className="flex items-center gap-2">
          {/* Meaning Controls */}
          <div className="bg-white border rounded-lg p-1 flex gap-1 shadow-sm items-center">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">
              Meaning:
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sendCommand("SHOW_MEANING_ALL")}
                    className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                  >
                    <Eye size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Show all meanings</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-[1px] h-4 bg-slate-200 my-auto"></div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sendCommand("HIDE_MEANING_ALL")}
                    className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                  >
                    <EyeOff size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hide all meanings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Shuffle */}
          <Button variant="outline" size="sm" onClick={handleShuffle}>
            <RotateCcw className="mr-2 h-4 w-4" /> Shuffle & Reset
          </Button>

          {/* MORE ACTIONS DROPDOWN (NEW) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                Flipped Cards ({flippedIds.size})
              </DropdownMenuLabel>
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

          {/* Remove All Popover */}
          <Popover open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                title="Remove all"
              >
                <Trash2 size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="font-medium leading-none text-red-600">
                    Clear study list?
                  </h4>
                  <p className="text-sm text-slate-500">
                    This action will remove all cards currently displayed.
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
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <div className="text-6xl mb-4 grayscale opacity-50">🎉</div>
          <p className="text-lg font-medium">Your study list is empty!</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto flex flex-wrap gap-6 justify-center content-start pb-10">
          {displayCards.map((item) => (
            <VocabularyCard
              key={item.id}
              item={item}
              command={command}
              onLearned={onMarkLearned}
              remove={(id) =>
                setDisplayCards(displayCards.filter((w) => w.id !== id))
              }
              onFlip={(isFlipped) => handleCardFlipReport(item.id, isFlipped)}
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
