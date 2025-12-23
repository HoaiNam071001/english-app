import { Button } from "@/components/ui/button";
import { VocabularyItem } from "@/types";
import { Shuffle } from "lucide-react";
import React, { useState } from "react";
import VocabularyCard from "./VocabularyCard";

interface FlashcardSectionProps {
  displayCards: VocabularyItem[];
  setDisplayCards: (vol: VocabularyItem[]) => void;
  onMarkLearned: (id: string) => void;
}

const FlashcardSection: React.FC<FlashcardSectionProps> = ({
  displayCards,
  setDisplayCards,
  onMarkLearned,
}) => {
  const [triggerFlipped, setTriggerFlipped] = useState<string>();

  const handleShuffle = () => {
    const shuffled = [...displayCards].sort(() => Math.random() - 0.5);
    setDisplayCards(shuffled);
    setTriggerFlipped(Math.random().toString());
  };

  return (
    <div className="w-full h-full p-6 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 min-h-[600px]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            🔥 Practice today
            <span className="px-3 py-1 rounded-full bg-slate-200 text-sm font-normal">
              {displayCards.length}
            </span>
          </h2>
        </div>

        <Button
          variant="outline"
          onClick={handleShuffle}
          disabled={displayCards.length === 0}
        >
          <Shuffle className="mr-2 h-4 w-4" /> Shuffle the cards
        </Button>
      </div>

      {displayCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 text-slate-400">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-xl font-medium">
            Tuyệt vời! Bạn đã sạch bóng từ vựng hôm nay.
          </p>
          <p className="text-sm mt-2">Hãy thêm từ mới hoặc nghỉ ngơi nhé.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center content-start">
          {displayCards.map((item) => (
            <VocabularyCard
              key={item.id}
              item={item}
              triggerFlipped={triggerFlipped}
              onLearned={onMarkLearned}
              remove={(id: string) => {
                setDisplayCards(displayCards.filter((w) => w.id !== id));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardSection;
