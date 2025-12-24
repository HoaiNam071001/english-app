import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // 1. Import Popover
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VocabularyItem } from "@/types";
import { Eye, EyeOff, RotateCcw, Trash2 } from "lucide-react";
import React, { useState } from "react";
import VocabularyCard from "./VocabularyCard";

interface FlashcardSectionProps {
  displayCards: VocabularyItem[];
  setDisplayCards: (vol: VocabularyItem[]) => void;
  onMarkLearned: (id: string) => void;
}

export type FlashcardCommand = {
  type: "SHOW_MEANING_ALL" | "HIDE_MEANING_ALL" | "RESET_FLIP";
  timestamp: number;
};

const FlashcardSection: React.FC<FlashcardSectionProps> = ({
  displayCards,
  setDisplayCards,
  onMarkLearned,
}) => {
  const [command, setCommand] = useState<FlashcardCommand | null>(null);

  // 2. State quản lý đóng mở Popover Xóa All
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  const sendCommand = (type: FlashcardCommand["type"]) => {
    setCommand({ type, timestamp: Date.now() });
  };

  const handleShuffle = () => {
    const shuffled = [...displayCards].sort(() => Math.random() - 0.5);
    setDisplayCards(shuffled);
    sendCommand("RESET_FLIP");
  };

  // 3. Hàm xử lý khi bấm nút "Xóa ngay" trong Popover
  const confirmRemoveAll = () => {
    setDisplayCards([]);
    setIsDeleteAllOpen(false); // Đóng popover sau khi xóa
  };

  return (
    <div className="w-full h-full p-6 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 min-h-[600px] flex flex-col">
      {/* --- TOOLBAR --- */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          🔥 Flashcard
          <span className="bg-slate-200 text-slate-700 text-sm py-0.5 px-2.5 rounded-full">
            {displayCards.length}
          </span>
        </h2>

        <div className="flex items-center gap-2">
          {/* Cụm điều khiển Nghĩa */}
          <div className="bg-white border rounded-lg p-1 flex gap-1 shadow-sm items-center">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">
              Nghĩa TV:
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
                <TooltipContent>Hiện nghĩa tất cả thẻ</TooltipContent>
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
                <TooltipContent>Che nghĩa tất cả thẻ</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Shuffle */}
          <Button variant="outline" size="sm" onClick={handleShuffle}>
            <RotateCcw className="mr-2 h-4 w-4" /> Trộn & Úp lại
          </Button>

          {/* 4. Thay thế nút Remove All cũ bằng POPOVER */}
          <Popover open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                title="Xóa tất cả thẻ"
              >
                <Trash2 size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="font-medium leading-none text-red-600">
                    Xóa danh sách ôn tập?
                  </h4>
                  <p className="text-sm text-slate-500">
                    Hành động này sẽ xóa toàn bộ thẻ đang hiển thị trên màn
                    hình.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteAllOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={confirmRemoveAll}
                  >
                    Đồng ý xóa
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
          <p className="text-lg font-medium">Sạch bóng từ vựng!</p>
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardSection;
