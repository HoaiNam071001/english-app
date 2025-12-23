import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VocabularyItem } from '@/types';
import { doc, updateDoc } from 'firebase/firestore';
import { Check, Eye, EyeOff, X } from 'lucide-react'; // 1. Import icon X
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';

interface VocabularyCardProps {
  item: VocabularyItem;
  triggerFlipped?: string;
  onLearned: (id: string) => void;
  remove: (id: string) => void; // Callback xóa
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({ item, triggerFlipped, onLearned, remove }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [triggerFlipped]);



  const handleMarkAsLearned = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const docRef = doc(db, "vocabulary", item.id);
      await updateDoc(docRef, { isLearned: true });
      onLearned(item.id);
    } catch (error) {
      console.error("Error updating doc:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Hàm xử lý nút Remove
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Quan trọng: Ngăn không cho thẻ bị lật
    remove(item.id);
  };

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className="cursor-pointer perspective-1000 w-full sm:w-48 h-64 transition-all duration-300 hover:-translate-y-1"
    >
      <Card className={`
        relative w-full h-full flex flex-col items-center justify-center p-4 text-center shadow-md transition-all duration-500
        ${isFlipped ? 'bg-white border-primary/50' : 'bg-slate-800 border-slate-700'}
      `}>

        {/* 3. NÚT REMOVE (Góc trái trên) */}
        {isFlipped && <div
          className="absolute top-2 left-2 p-1 rounded-full hover:bg-slate-100/10 transition-colors z-10"
          onClick={handleRemove}
          title="Bỏ qua từ này"
        >
          <X
            size={16}
            className={`transition-colors ${isFlipped ? 'text-slate-400 hover:text-red-500' : 'text-slate-500 hover:text-red-400'}`}
          />
        </div>}

        {/* 4. Icon EYE (Góc phải trên - Giữ nguyên) */}
        <div className="absolute top-2 right-2 text-xs text-slate-400">
          {isFlipped ? <EyeOff size={14}/> : <Eye size={14}/>}
        </div>

        {/* MẶT SAU (ÚP) */}
        {!isFlipped && (
          <div className="text-slate-100 font-bold text-4xl select-none opacity-50">
            ?
          </div>
        )}

        {/* MẶT TRƯỚC (NGỬA) */}
        {isFlipped && (
          <div className="flex flex-col h-full justify-between w-full animate-in fade-in zoom-in duration-300 pt-6"> {/* Thêm pt-6 để tránh đè nút X */}
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-primary mb-2 break-words">{item.text}</h3>
              <p className="text-slate-600 text-sm italic break-words">{item.meaning}</p>
            </div>

            <Button
              size="sm"
              variant="default"
              className="w-full bg-green-600 hover:bg-green-700 mt-2"
              onClick={handleMarkAsLearned}
              disabled={loading}
            >
              <Check size={16} className="mr-1" /> Đã thuộc
            </Button>
          </div>
        )}

      </Card>
    </div>
  );
};

export default VocabularyCard;
