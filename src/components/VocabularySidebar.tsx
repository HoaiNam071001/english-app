import moment from "moment";
import "moment/locale/vi";
import React, { useEffect, useMemo, useState } from "react";

import {
  BookOpen,
  CheckSquare,
  Eye,
  EyeOff,
  RotateCcw,
  Search,
  Trash2,
  X, // <--- Đã có icon X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VocabularyItem } from "@/types";
import { VocabularyItemRow } from "./VocabularyItemRow";

moment.locale("vi");

interface VocabularySidebarProps {
  allWords: VocabularyItem[];
  activeWordIds: Set<string>;
  onAddToPractice: (word: VocabularyItem) => void;
  onDelete: (id: string) => void;
  onBulkAddToPractice?: (words: VocabularyItem[]) => void;
  onRemoveFromPractice?: (word: VocabularyItem) => void;
  onBulkDelete?: (ids: string[]) => void;
  onUpdateWord?: (id: string, updates: Partial<VocabularyItem>) => void;
  onToggleLearned: (id: string, currentStatus: boolean) => void;
  onBulkMarkLearned?: (ids: string[], status: boolean) => void;
}

const formatDateGroup = (dateString: string) => {
  const date = moment(dateString);
  if (!date.isValid()) return "Date unknown";
  const now = moment();
  if (date.isSame(now, "day")) return "Today";
  if (date.isSame(now.clone().subtract(1, "days"), "day")) return "Yesterday";
  const formatted = date.format("dddd, DD/MM/YYYY");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const VocabularySidebar: React.FC<VocabularySidebarProps> = ({
  allWords,
  activeWordIds,
  onAddToPractice,
  onDelete,
  onBulkAddToPractice,
  onBulkDelete,
  onUpdateWord,
  onToggleLearned,
  onRemoveFromPractice,
  onBulkMarkLearned,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredWords = useMemo(() => {
    if (!debouncedTerm.trim()) return allWords;
    const lowerTerm = debouncedTerm.toLowerCase();
    return allWords.filter((word) => {
      return (
        word.text.toLowerCase().includes(lowerTerm) ||
        word.meaning.toLowerCase().includes(lowerTerm) ||
        (word.example && word.example.toLowerCase().includes(lowerTerm))
      );
    });
  }, [allWords, debouncedTerm]);

  const groupedWords = useMemo(() => {
    const groups: Record<string, VocabularyItem[]> = {};
    filteredWords.forEach((word) => {
      const dateKey = moment(word.createdAt).format("YYYY-MM-DD");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(word);
    });
    return groups;
  }, [filteredWords]);

  const sortedDateKeys = useMemo(
    () => Object.keys(groupedWords).sort((a, b) => b.localeCompare(a)),
    [groupedWords]
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredWords.map((w) => w.id)));
    } else {
      setSelectedIds(new Set());
    }
    setLastSelectedId(null);
  };

  // 1. HÀM MỚI: DESELECT ALL
  const handleDeselectAll = () => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  };

  const toggleSelection = (id: string, event?: React.MouseEvent) => {
    const newSet = new Set(selectedIds);

    if (event?.shiftKey && lastSelectedId) {
      const visibleIds = filteredWords.map((w) => w.id);
      const lastIndex = visibleIds.indexOf(lastSelectedId);
      const currentIndex = visibleIds.indexOf(id);

      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeIds = visibleIds.slice(start, end + 1);
        rangeIds.forEach((rid) => newSet.add(rid));
      }
    } else {
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setLastSelectedId(id);
    }
    setSelectedIds(newSet);
  };

  const selectedWords = useMemo(() => {
    return allWords.filter((w) => selectedIds.has(w.id));
  }, [allWords, selectedIds]);

  const isAllSelectedLearned = useMemo(() => {
    return selectedWords.length > 0 && selectedWords.every((w) => w.isLearned);
  }, [selectedWords]);

  const handleBulkMark = () => {
    if (onBulkMarkLearned) {
      const targetStatus = !isAllSelectedLearned;
      onBulkMarkLearned(Array.from(selectedIds), targetStatus);
      setSelectedIds(new Set());
      setLastSelectedId(null);
    }
  };

  const isAllRevealed =
    filteredWords.length > 0 && revealedIds.size === filteredWords.length;

  const toggleRevealAll = () => {
    if (isAllRevealed) {
      setRevealedIds(new Set());
    } else {
      setRevealedIds(new Set(filteredWords.map((w) => w.id)));
    }
  };

  const toggleRevealItem = (id: string) => {
    const newSet = new Set(revealedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setRevealedIds(newSet);
  };

  const handleBulkAdd = () => {
    if (!onBulkAddToPractice) return;
    const words = allWords.filter((w) => selectedIds.has(w.id));
    onBulkAddToPractice(words);
    setSelectedIds(new Set());
    setLastSelectedId(null);
  };

  const confirmBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsBulkDeleteOpen(false);
      setLastSelectedId(null);
    }
  };

  return (
    <div className="flex flex-col bg-white border-r pr-4 h-full overflow-y-hidden">
      {/* SEARCH BAR */}
      <div className="p-3 pb-0 z-20">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search for vocabulary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 bg-slate-50 border-slate-200 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* HEADER TOOLBAR */}
      <div className="p-3 border-b flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={
              filteredWords.length > 0 &&
              selectedIds.size === filteredWords.length
            }
            onCheckedChange={(c) => handleSelectAll(c as boolean)}
          />
          <span className="text-sm font-semibold text-slate-700">
            {selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : `List (${filteredWords.length})`}
          </span>
        </div>

        <div className="flex gap-1 items-center">
          {selectedIds.size > 0 && (
            <>
              {/* 2. NÚT DESELECT ALL (Mới thêm) */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDeselectAll}
                      className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                      <X size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Deselect all</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Đường kẻ phân cách */}
              <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>

              {/* Các nút Action cũ */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBulkMark}
                      className={`h-8 w-8 ${
                        isAllSelectedLearned
                          ? "text-orange-500 hover:bg-orange-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {isAllSelectedLearned ? (
                        <RotateCcw size={16} />
                      ) : (
                        <CheckSquare size={16} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isAllSelectedLearned
                      ? `Mark not yet memorized (${selectedIds.size})`
                      : `Mark already memorized (${selectedIds.size})`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBulkAdd}
                      className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                    >
                      <BookOpen size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add to lesson</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Popover
                open={isBulkDeleteOpen}
                onOpenChange={setIsBulkDeleteOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-3" align="end">
                  <div className="space-y-3">
                    <p className="text-sm">
                      Remove the selected {selectedIds.size} word?
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsBulkDeleteOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={confirmBulkDelete}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleRevealAll}
                  className="h-8 w-8 text-slate-500"
                >
                  {isAllRevealed ? <Eye size={18} /> : <EyeOff size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isAllRevealed ? "Hide all meanings" : "Show all meanings"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* LIST CONTENT */}
      <ScrollArea className="flex-1 mt-0 overflow-auto pr-2">
        <div className="pb-10">
          {sortedDateKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-10 text-slate-400 gap-2">
              <Search size={32} className="opacity-20" />
              <span className="text-sm">No results found.</span>
            </div>
          ) : (
            sortedDateKeys.map((dateKey) => (
              <div key={dateKey} className="mb-6 last:mb-0">
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-2 py-2 mb-2 text-xs font-bold text-blue-600 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>{formatDateGroup(dateKey)}</span>
                  <span className="bg-slate-100 text-slate-500 px-1.5 rounded-full text-[10px]">
                    {groupedWords[dateKey].length}
                  </span>
                </div>

                <div className="space-y-1">
                  {groupedWords[dateKey].map((word) => (
                    <VocabularyItemRow
                      key={word.id}
                      word={word}
                      isActive={activeWordIds.has(word.id)}
                      isSelected={selectedIds.has(word.id)}
                      isMeaningRevealed={revealedIds.has(word.id)}
                      onToggleSelection={toggleSelection}
                      onToggleReveal={toggleRevealItem}
                      onAddToPractice={onAddToPractice}
                      onUpdate={onUpdateWord || (() => {})}
                      onDelete={onDelete}
                      onToggleLearned={onToggleLearned}
                      onRemoveFromPractice={onRemoveFromPractice}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default VocabularySidebar;
