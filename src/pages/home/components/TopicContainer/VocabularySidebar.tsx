import moment from "moment";
import "moment/locale/vi";
import React, { useEffect, useMemo, useState } from "react";

import {
  BookOpen,
  CheckSquare,
  Eye,
  EyeOff,
  FolderInput,
  MoreHorizontal,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { BulkLookupModal } from "../Lookup/BulkLookupModal";
import MoveTopicModal from "../common/MoveTopicModal"; // <--- Import Component Mới
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
  onBulkUpdate?: (ids: string[], updates: Partial<VocabularyItem>) => void;
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
  onBulkUpdate,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [isBulkLookupOpen, setIsBulkLookupOpen] = useState(false);

  // State điều khiển Modal Move Topic
  const [isMoveTopicModalOpen, setIsMoveTopicModalOpen] = useState(false);

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

  // --- ACTIONS HANDLERS ---

  const handleBulkMark = () => {
    if (onBulkMarkLearned) {
      const targetStatus = !isAllSelectedLearned;
      onBulkMarkLearned(Array.from(selectedIds), targetStatus);
      setSelectedIds(new Set());
      setLastSelectedId(null);
    }
  };

  const handleBulkAdd = () => {
    if (!onBulkAddToPractice) return;
    const words = allWords.filter((w) => selectedIds.has(w.id));
    onBulkAddToPractice(words);
    setSelectedIds(new Set());
    setLastSelectedId(null);
  };

  // Hàm xử lý xác nhận từ MoveTopicModal
  const confirmBulkMove = (topicId: string | undefined) => {
    if (!onBulkUpdate) return;
    onBulkUpdate(Array.from(selectedIds), { topicId: topicId });
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

  const handleSelectDate = (dateKey: string) => {
    // 1. Lấy danh sách ID của các từ trong ngày đó
    const wordsInDate = groupedWords[dateKey] || [];
    const idsInDate = wordsInDate.map((w) => w.id);

    // 2. Kiểm tra xem tất cả đã được chọn chưa
    // (Nếu tất cả đã nằm trong selectedIds -> Tức là đang chọn full -> Cần bỏ chọn)
    const isAllSelected = idsInDate.every((id) => selectedIds.has(id));

    const newSet = new Set(selectedIds);

    if (isAllSelected) {
      // Bỏ chọn tất cả item trong ngày này
      idsInDate.forEach((id) => newSet.delete(id));
    } else {
      // Chọn tất cả item trong ngày này (Additive)
      idsInDate.forEach((id) => newSet.add(id));
    }

    setSelectedIds(newSet);
    setLastSelectedId(null); // Reset last click để tránh lỗi shift-click
  };

  const handleBulkLookupApply = (
    id: string,
    updates: Partial<VocabularyItem>
  ) => {
    if (onUpdateWord) {
      onUpdateWord(id, updates);
    }
  };

  return (
    <div className="flex flex-col bg-card border-r pr-4 h-full overflow-y-hidden">
      {/* 1. COMPONENT MODAL (Đặt ở ngoài cùng để không bị lỗi z-index) */}
      <MoveTopicModal
        open={isMoveTopicModalOpen}
        onOpenChange={setIsMoveTopicModalOpen}
        selectedCount={selectedIds.size}
        onConfirm={confirmBulkMove}
      />

      <BulkLookupModal
        open={isBulkLookupOpen}
        onOpenChange={setIsBulkLookupOpen}
        selectedWords={selectedWords} // List các từ đang được chọn
        onApplyUpdates={handleBulkLookupApply}
      />

      {/* SEARCH BAR */}
      <div className="p-3 pb-0 z-20">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 bg-muted/50 border-border focus:bg-background transition-all h-9 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* HEADER TOOLBAR */}
      <div className="p-3 border-b flex items-center justify-between bg-card z-10">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={
              filteredWords.length > 0 &&
              selectedIds.size === filteredWords.length
            }
            onCheckedChange={(c) => handleSelectAll(c as boolean)}
          />
          <span className="text-sm font-semibold text-card-foreground">
            {selectedIds.size > 0
              ? `(${selectedIds.size})`
              : `List (${filteredWords.length})`}
          </span>
        </div>

        <div className="flex gap-1 items-center">
          {selectedIds.size > 0 ? (
            <>
              {/* Nút Deselect */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDeselectAll}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <X size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Deselect all</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsBulkLookupOpen(true)}
                      className="h-8 w-8 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950"
                    >
                      <Sparkles size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Find & fill missing fields</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Nút Add to Practice */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBulkAdd}
                      className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                    >
                      <BookOpen size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add to lesson</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Popup Delete Confirm */}
              <Popover
                open={isBulkDeleteOpen}
                onOpenChange={setIsBulkDeleteOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                  >
                    <Trash2 size={16} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-3" align="start">
                  <div className="space-y-3">
                    <p className="text-sm">
                      Remove {selectedIds.size} selected words?
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

              {/* MENU ACTIONS GỘP */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground hover:bg-accent"
                  >
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    Actions ({selectedIds.size})
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Mark Learned/Unlearned */}
                  <DropdownMenuItem onClick={handleBulkMark}>
                    {isAllSelectedLearned ? (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" /> Mark as Unlearned
                      </>
                    ) : (
                      <>
                        <CheckSquare className="mr-2 h-4 w-4" /> Mark as Learned
                      </>
                    )}
                  </DropdownMenuItem>

                  {/* 2. GỌI MODAL MOVE TOPIC TỪ ĐÂY */}
                  <DropdownMenuItem
                    onClick={() => setIsMoveTopicModalOpen(true)}
                  >
                    <FolderInput className="mr-2 h-4 w-4" />
                    Assign Topic
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // State: Chưa chọn gì
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleRevealAll}
                    className="h-8 w-8 text-muted-foreground"
                  >
                    {isAllRevealed ? <Eye size={18} /> : <EyeOff size={18} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isAllRevealed ? "Hide all meanings" : "Show all meanings"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* LIST CONTENT */}
      <ScrollArea className="flex-1 mt-0 overflow-y-auto pr-2 overflow-x-hidden">
        <div className="pb-10 overflow-x-hidden">
          {sortedDateKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-10 text-muted-foreground gap-2">
              <Search size={32} className="opacity-20" />
              <span className="text-sm">No results found.</span>
            </div>
          ) : (
            sortedDateKeys.map((dateKey) => {
              // Tính toán trạng thái checkbox của ngày này (để hiển thị UI nếu muốn)
              const wordsInGroup = groupedWords[dateKey];
              const allSelected = wordsInGroup.every((w) =>
                selectedIds.has(w.id)
              );

              return (
                <div key={dateKey} className="mb-6 last:mb-0">
                  {/* HEADER NGÀY: Thêm onClick và cursor-pointer */}
                  <div
                    onClick={() => handleSelectDate(dateKey)}
                    className={`
                        sticky top-0 bg-card/95 backdrop-blur-sm z-10 px-2 py-2 mb-2
                        text-xs font-bold uppercase tracking-wider border-b border-border
                        flex items-center justify-between cursor-pointer transition-colors hover:bg-accent
                        ${
                          allSelected
                            ? "text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
                            : "text-blue-600 dark:text-blue-400"
                        }
                      `}
                    title="Click to select all items in this date"
                  >
                    <div className="flex items-center gap-2">
                      {/* (Optional) Thêm checkbox nhỏ ở đây nếu muốn rõ ràng hơn */}
                      <Checkbox
                        checked={allSelected}
                        // Checkbox này chỉ để hiển thị, sự kiện click đã được div cha xử lý
                        className="h-4 w-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <span>{formatDateGroup(dateKey)}</span>
                    </div>

                    <span
                      className={`px-1.5 rounded-full text-[10px] ${
                        allSelected
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {wordsInGroup.length}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {wordsInGroup.map((word) => (
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
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default VocabularySidebar;
