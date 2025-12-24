import moment from "moment";
import "moment/locale/vi";
import React, { useMemo, useState } from "react";

// Thêm icon RotateCcw
import {
  BookOpen,
  CheckSquare,
  Eye,
  EyeOff,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  onUpdateWord?: (id: string, newText: string, newMeaning: string) => void;
  onToggleLearned: (id: string, currentStatus: boolean) => void;
  // UPDATE: Thêm tham số status (true/false)
  onBulkMarkLearned?: (ids: string[], status: boolean) => void;
}

const formatDateGroup = (dateString: string) => {
  const date = moment(dateString);
  if (!date.isValid()) return "Ngày không xác định";
  const now = moment();
  if (date.isSame(now, "day")) return "Hôm nay";
  if (date.isSame(now.clone().subtract(1, "days"), "day")) return "Hôm qua";
  const formatted = date.format("dddd, DD/MM/YYYY");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// ==========================================
// MAIN COMPONENT
// ==========================================
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

  const groupedWords = useMemo(() => {
    const groups: Record<string, VocabularyItem[]> = {};
    allWords.forEach((word) => {
      const dateKey = moment(word.createdAt).format("YYYY-MM-DD");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(word);
    });
    return groups;
  }, [allWords]);

  const sortedDateKeys = useMemo(
    () => Object.keys(groupedWords).sort((a, b) => b.localeCompare(a)),
    [groupedWords]
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(allWords.map((w) => w.id)) : new Set());
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  // --- LOGIC MỚI: CHECK TRẠNG THÁI CÁC MỤC ĐANG CHỌN ---
  const selectedWords = useMemo(() => {
    return allWords.filter((w) => selectedIds.has(w.id));
  }, [allWords, selectedIds]);

  // Kiểm tra xem tất cả mục đã chọn có phải đều đã thuộc không?
  const isAllSelectedLearned = useMemo(() => {
    return selectedWords.length > 0 && selectedWords.every((w) => w.isLearned);
  }, [selectedWords]);

  const handleBulkMark = () => {
    if (onBulkMarkLearned) {
      // Nếu tất cả đã thuộc -> status mới là false (học lại)
      // Nếu có cái chưa thuộc -> status mới là true (đã thuộc)
      const targetStatus = !isAllSelectedLearned;
      onBulkMarkLearned(Array.from(selectedIds), targetStatus);
      setSelectedIds(new Set());
    }
  };
  // -----------------------------------------------------

  const isAllRevealed =
    allWords.length > 0 && revealedIds.size === allWords.length;

  const toggleRevealAll = () => {
    if (isAllRevealed) {
      setRevealedIds(new Set());
    } else {
      setRevealedIds(new Set(allWords.map((w) => w.id)));
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
  };

  const confirmBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsBulkDeleteOpen(false);
    }
  };

  return (
    <div className="flex flex-col bg-white border-r pr-4 h-full overflow-y-hidden">
      {/* HEADER TOOLBAR */}
      <div className="p-3 border-b flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={
              allWords.length > 0 && selectedIds.size === allWords.length
            }
            onCheckedChange={(c) => handleSelectAll(c as boolean)}
          />
          <span className="text-sm font-semibold text-slate-700">
            {selectedIds.size > 0
              ? `${selectedIds.size} đã chọn`
              : "Danh sách từ"}
          </span>
        </div>

        <div className="flex gap-1">
          {selectedIds.size > 0 ? (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBulkMark}
                      // Đổi màu nút dựa trên hành động sẽ thực hiện
                      className={`h-8 w-8 ${
                        isAllSelectedLearned
                          ? "text-orange-500 hover:bg-orange-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {/* Đổi icon dựa trên hành động */}
                      {isAllSelectedLearned ? (
                        <RotateCcw size={16} />
                      ) : (
                        <CheckSquare size={16} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isAllSelectedLearned
                      ? `Đánh dấu chưa thuộc (${selectedIds.size})`
                      : `Đánh dấu đã thuộc (${selectedIds.size})`}
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
                  <TooltipContent>Thêm vào bài học</TooltipContent>
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
                      Xóa {selectedIds.size} từ đã chọn?
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsBulkDeleteOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={confirmBulkDelete}
                      >
                        Xóa ngay
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
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
                  {isAllRevealed ? "Che tất cả nghĩa" : "Hiện tất cả nghĩa"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* LIST CONTENT */}
      <ScrollArea className="flex-1 mt-4 overflow-auto">
        <div className="pb-10">
          {sortedDateKeys.map((dateKey) => (
            <div key={dateKey} className="mb-6 last:mb-0">
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-2 py-1.5 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
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
          ))}

          {allWords.length === 0 && (
            <div className="text-center text-slate-400 mt-10 text-sm">
              Chưa có từ vựng nào.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default VocabularySidebar;
