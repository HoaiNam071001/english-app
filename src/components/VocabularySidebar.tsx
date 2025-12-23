import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VocabularyItem } from "@/types";
import { BookOpen, CheckCircle2, Circle, Eye, EyeOff, Plus, Trash2 } from "lucide-react"; // Import Eye, EyeOff
import React, { useState } from "react";

interface VocabularySidebarProps {
  allWords: VocabularyItem[];
  onAddToPractice: (word: VocabularyItem) => void;
  onDelete: (id: string) => void;
  activeWordIds: Set<string>;
}

const VocabularySidebar: React.FC<VocabularySidebarProps> = ({
  allWords,
  activeWordIds,
  onAddToPractice,
  onDelete
}) => {
  // State lưu trữ danh sách các ID đang được "hé lộ" (unmasked)
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const toggleReveal = (id: string) => {
    const newSet = new Set(revealedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setRevealedIds(newSet);
  };

  return (
    <div className="h-[calc(100vh-100px)] border-r pr-4">
      <h3 className="font-semibold text-lg mb-4 px-2">
        Lịch sử từ vựng ({allWords.length})
      </h3>
      <ScrollArea className="h-full pr-3">
        <div className="space-y-2">
          {allWords.map((word) => {
            const isActive = activeWordIds.has(word.id);
            // Mặc định: Nếu đang active (đang học) thì che lại, trừ khi đã bấm reveal
            const isMasked = isActive && !revealedIds.has(word.id);

            return (
              <div
                key={word.id}
                className={`
                  relative p-3 text-sm border rounded transition-all flex items-center gap-2 group
                  ${isActive
                    ? "bg-blue-50 border-blue-400 shadow-sm"
                    : "hover:bg-slate-50 border-slate-200"
                  }
                `}
              >
                {/* Icon trạng thái */}
                <div className="mt-1 shrink-0">
                  {word.isLearned ? (
                    <CheckCircle2 size={14} className="text-green-500" />
                  ) : (
                    <Circle size={14} className="text-slate-300" />
                  )}
                </div>

                {/* Nội dung từ (Xử lý hiệu ứng che) */}
                <div className="flex-1 min-w-0 transition-all duration-300">
                  <div className="font-medium flex justify-between items-center">
                    <span
                      className={`truncate transition-all ${
                        isMasked ? "blur-[4px] select-none opacity-50" : ""
                      } ${word.isLearned && !isActive ? "text-slate-500 line-through" : "text-slate-900"}`}
                    >
                      {word.text}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-2">
                      {new Date(word.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div
                    className={`text-slate-500 line-clamp-1 text-xs mt-1 transition-all ${
                      isMasked ? "blur-[4px] select-none opacity-50" : ""
                    }`}
                  >
                    {word.meaning}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                {/* Logic hiển thị: Nếu đang Active -> Luôn hiện nút điều khiển. Nếu không -> Chỉ hiện khi hover */}
                <div className={`
                    absolute right-2 flex gap-1 bg-white/90 backdrop-blur-sm shadow-sm rounded-md p-1 transition-opacity
                    ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}>

                  {/* Nút Xem/Che (Chỉ hiện khi đang Active) */}
                  {isActive && (
                     <TooltipProvider>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-7 w-7 text-slate-500 hover:bg-slate-100"
                           onClick={(e) => {
                             e.stopPropagation();
                             toggleReveal(word.id);
                           }}
                         >
                           {isMasked ? <Eye size={14} /> : <EyeOff size={14} />}
                         </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>{isMasked ? "Hiện nội dung" : "Che nội dung"}</p>
                       </TooltipContent>
                     </Tooltip>
                   </TooltipProvider>
                  )}

                  {/* Nút Xóa */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(word.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Xóa vĩnh viễn</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Nút Add hoặc Icon sách */}
                  {isActive ? (
                    <div className="flex items-center justify-center h-7 w-7 text-blue-500 cursor-help" title="Đang trong bài học">
                      <BookOpen size={14} />
                    </div>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:text-blue-600 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToPractice(word);
                            }}
                          >
                            <Plus size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Thêm vào luyện tập</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default VocabularySidebar;
