import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTable, VocabularyItem } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { Check, Eye, EyeOff, Volume2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { FlashcardCommand } from "./FlashcardSection";

interface VocabularyCardProps {
  item: VocabularyItem;
  command: FlashcardCommand | null;
  onLearned: (id: string) => void;
  remove: (id: string) => void;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  item,
  command,
  onLearned,
  remove,
}) => {
  // 1. State Lật/Úp (Mặt trước/Mặt sau)
  const [isFlipped, setIsFlipped] = useState(false);

  // 2. State Ẩn/Hiện Nghĩa (Chỉ có tác dụng khi đã Lật)
  const [showMeaning, setShowMeaning] = useState(false); // Mặc định che nghĩa để học thuộc

  const [loading, setLoading] = useState(false);

  // --- Lắng nghe lệnh Global ---
  useEffect(() => {
    if (command) {
      if (command.type === "SHOW_MEANING_ALL") setShowMeaning(true);
      if (command.type === "HIDE_MEANING_ALL") setShowMeaning(false);
      if (command.type === "RESET_FLIP") {
        setIsFlipped(false); // Úp bài xuống
        setShowMeaning(false); // Reset luôn nghĩa về trạng thái che
      }
    }
  }, [command]);

  // --- Xử lý sự kiện ---
  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const toggleMeaning = (e: React.MouseEvent) => {
    e.stopPropagation(); // Không kích hoạt lật bài
    setShowMeaning((prev) => !prev);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    remove(item.id);
  };

  const handleMarkAsLearned = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const docRef = doc(db, DataTable.Vocabulary, item.id);
      await updateDoc(docRef, { isLearned: true });
      onLearned(item.id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer perspective-1000 group w-full sm:w-40 h-60 transition-all duration-300 hover:-translate-y-2"
    >
      <Card
        className={`
        relative w-full h-full flex flex-col items-center justify-center p-4 text-center shadow-lg border-2 transition-all duration-500 overflow-hidden
        ${
          isFlipped
            ? "bg-white border-blue-200" // Đã lật (Mặt nội dung)
            : "bg-slate-800 border-slate-700 shadow-slate-900" // Đang úp (Mặt lưng)
        }
      `}
      >
        {/* --- TRƯỜNG HỢP 1: ĐANG ÚP (Back Side) --- */}
        {!isFlipped && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            {/* Nút Remove vẫn hiện mờ mờ khi úp để xóa nhanh nếu muốn */}
            <div
              className="absolute top-2 left-2 p-2 rounded-full hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 z-20"
              onClick={handleRemove}
              title="Xóa thẻ"
            >
              <X size={18} />
            </div>

            <div className="text-slate-600 font-bold text-6xl select-none opacity-20">
              ?
            </div>
            <p className="text-slate-500 text-xs mt-4 uppercase tracking-widest opacity-60">
              Chạm để lật
            </p>
          </div>
        )}

        {/* --- TRƯỜNG HỢP 2: ĐÃ LẬT (Front Side) --- */}
        {isFlipped && (
          <div className="flex flex-col h-full w-full animate-in fade-in zoom-in duration-300 pt-2 pb-1 relative">
            {/* === HEADER CONTROLS (Chỉ hiện khi lật) === */}

            {/* 1. Nút Remove (Góc trái trên) */}
            <div
              className="absolute -top-3 -left-3 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer z-30"
              onClick={handleRemove}
              title="Bỏ thẻ này"
            >
              <X size={18} />
            </div>

            {/* === MAIN CONTENT === */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Nút Loa (Cạnh từ tiếng Anh) */}
              <div
                className="mb-2 p-2 absolute top-0 rounded-full bg-blue-50 text-blue-600 hover:scale-110 transition-transform cursor-pointer"
                onClick={handleSpeak}
              >
                <Volume2 size={18} />
              </div>

              {/* TỪ VỰNG (Luôn hiện) */}
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {item.text}
              </h3>

              {/* NGHĨA (Ẩn/Hiện dựa vào state showMeaning) */}
              {item.meaning && (
                <div
                  className={`
                  w-full px-2 transition-all duration-300 flex flex-col items-center gap-2
                  ${
                    showMeaning
                      ? "opacity-100 blur-0"
                      : "opacity-40 blur-sm select-none grayscale"
                  }
                `}
                  // Nếu đang bị che mà click vào vùng nghĩa thì cũng mở nghĩa ra luôn cho tiện
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMeaning(!showMeaning);
                  }}
                >
                  <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
                  <p className="text-sm font-medium text-slate-600 break-words leading-relaxed text-center">
                    {item.meaning}
                  </p>
                </div>
              )}
            </div>

            {/* === FOOTER ACTION === */}

            <div className="flex justify-between">
              {/* 2. Nút Ẩn/Hiện Nghĩa (Góc phải trên) */}

              {item.meaning && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className=" right-0 p-2 rounded-full hover:bg-slate-100 text-blue-500 hover:text-blue-700 transition-colors cursor-pointer z-30"
                        onClick={toggleMeaning}
                        title={showMeaning ? "Ẩn nghĩa" : "Xem nghĩa"}
                      >
                        {showMeaning ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">
                        {showMeaning ? "Ẩn nghĩa" : "Xem nghĩa"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="w-full w-10 text-green-600 bg-transparent hover:bg-green-600 hover:text-white shadow-sm text-center"
                      onClick={handleMarkAsLearned}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="animate-spin mr-2">⏳</span>
                      ) : (
                        <Check size={16} className="mr-1" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Đánh dấu đã thuộc</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VocabularyCard;
