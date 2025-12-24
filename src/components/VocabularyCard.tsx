import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (command) {
      if (command.type === "SHOW_MEANING_ALL") setShowMeaning(true);
      if (command.type === "HIDE_MEANING_ALL") setShowMeaning(false);
      if (command.type === "RESET_FLIP") {
        setIsFlipped(false);
        setShowMeaning(false);
      }
    }
  }, [command]);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const toggleMeaning = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      className="cursor-pointer perspective-1000 group w-full sm:w-40 h-50 transition-all duration-300 hover:translate-y-1"
    >
      <Card
        className={`
        relative w-full h-full flex flex-col items-center justify-center p-2 text-center shadow-lg border-2 transition-all duration-500 overflow-hidden
        ${
          isFlipped
            ? "bg-white border-blue-200"
            : "bg-slate-800 border-slate-700 shadow-slate-900"
        }
      `}
      >
        {/* --- MẶT ÚP --- */}
        {!isFlipped && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div
              className="absolute top-0 left-0 p-2 rounded-full hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 z-20"
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

        {/* --- MẶT NGỬA --- */}
        {isFlipped && (
          <div className="flex flex-col h-full w-full animate-in fade-in zoom-in duration-300 pt-4 pb-1 relative">
            {/* Nút Remove */}
            <div
              className="absolute top-0 left-0 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer z-30"
              onClick={handleRemove}
              title="Bỏ thẻ này"
            >
              <X size={18} />
            </div>

            {/* Nút Loa */}
            <div
              className="mb-2 p-2 absolute top-0 right-0 rounded-full bg-blue-50 text-blue-600 hover:scale-110 transition-transform cursor-pointer z-30"
              onClick={handleSpeak}
            >
              <Volume2 size={18} />
            </div>

            {/* === MAIN CONTENT === */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* 2. LOGIC HIỂN THỊ TỪ VỰNG + POPOVER VÍ DỤ */}
              {item.example ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <h3
                      className="text-xl font-bold text-slate-800 mb-2 cursor-help decoration-dashed underline decoration-slate-300 underline-offset-4 hover:text-blue-600 transition-colors"
                      onClick={(e) => e.stopPropagation()} // Chặn sự kiện click để không bị lật thẻ
                      title="Click to see note"
                    >
                      {item.text}
                    </h3>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-64 p-3 bg-white/95 backdrop-blur shadow-xl text-sm"
                    side="top"
                  >
                    <div className="font-semibold text-slate-700 mb-1 border-b pb-1">
                      Note:
                    </div>
                    <p className="text-slate-600 italic leading-relaxed">
                      {item.example}
                    </p>
                  </PopoverContent>
                </Popover>
              ) : (
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {item.text}
                </h3>
              )}
              {/* ------------------------------------------- */}

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
              {item.meaning && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="right-0 p-2 rounded-full hover:bg-slate-100 text-blue-500 hover:text-blue-700 transition-colors cursor-pointer z-30"
                        onClick={toggleMeaning}
                      >
                        {showMeaning ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">
                        {showMeaning ? "Hidden meaning" : "View meaning"}
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
                  <TooltipContent side="top">
                    Mark already memorized
                  </TooltipContent>
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
