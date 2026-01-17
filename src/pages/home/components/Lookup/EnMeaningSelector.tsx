import { Checkbox } from "@/components/ui/checkbox";
import { EnMeaningItem } from "@/utils/vocabularyUtils"; // Import type từ file common
import { CheckedState } from "@radix-ui/react-checkbox";
import React from "react";

interface EnMeaningSelectorProps {
  meanings: EnMeaningItem[];
  selectedIndices: number[]; // Controlled state từ parent
  onSelectionChange: (newIndices: number[]) => void;
  idPrefix?: string; // Prefix cho ID để tránh trùng lặp nếu dùng nhiều nơi
}

export const EnMeaningSelector: React.FC<EnMeaningSelectorProps> = ({
  meanings,
  selectedIndices,
  onSelectionChange,
  idPrefix = "en-meaning",
}) => {
  if (!meanings || meanings.length === 0) {
    return (
      <span className="text-muted-foreground text-xs italic">
        No definitions found.
      </span>
    );
  }
  // --- Logic Helpers ---
  const areAllChecked =
    meanings.length > 0 && selectedIndices.length === meanings.length;

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(meanings.map((_, i) => i));
    } else {
      onSelectionChange([]);
    }
  };

  const handleToggleSingle = (index: number) => {
    if (selectedIndices.includes(index)) {
      onSelectionChange(selectedIndices.filter((i) => i !== index));
    } else {
      onSelectionChange([...selectedIndices, index]);
    }
  };

  return (
    <div className="space-y-2 md:space-y-3">
      {/* HEADER: SELECT ALL */}
      <div className="flex items-center gap-1 md:gap-2 pb-1 md:pb-2 mb-1 md:mb-2 border-b border-dashed border-muted-foreground/20">
        <Checkbox
          id={`${idPrefix}-all`}
          className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0"
          checked={areAllChecked}
          onCheckedChange={(c: CheckedState) => handleToggleAll(c === true)}
        />
        <label
          htmlFor={`${idPrefix}-all`}
          className="text-[9px] md:text-[10px] uppercase text-muted-foreground font-semibold cursor-pointer select-none"
        >
          Select All
        </label>
      </div>

      {/* LIST ITEMS */}
      <div className="space-y-0.5 md:space-y-1">
        {meanings.map((m, idx) => {
          const isSelected = selectedIndices.includes(idx);
          const uniqueId = `${idPrefix}-${idx}`;

          return (
            <div key={idx} className="flex gap-1.5 md:gap-3 items-start group/item">
              <Checkbox
                id={uniqueId}
                checked={isSelected}
                onCheckedChange={() => handleToggleSingle(idx)}
                className="mt-0.5 md:mt-1 shrink-0 h-3 w-3 md:h-3.5 md:w-3.5"
              />

              {/* Số thứ tự */}
              <label
                htmlFor={uniqueId}
                className={`text-[10px] md:text-xs font-mono mt-0.5 w-3 md:w-4 shrink-0 text-center cursor-pointer select-none ${
                  isSelected
                    ? "text-blue-600 font-bold"
                    : "text-muted-foreground"
                }`}
              >
                {idx + 1}
              </label>

              {/* Nội dung */}
              <div
                className={`flex-1 cursor-pointer transition-opacity ${
                  isSelected ? "opacity-100" : "opacity-60 grayscale"
                }`}
                onClick={() => handleToggleSingle(idx)}
              >
                <div className="break-words">
                  <span className="font-semibold italic text-muted-foreground text-[9px] md:text-xs mr-1 md:mr-2">
                    ({m.partOfSpeech})
                  </span>
                  <span className="text-foreground text-[10px] md:text-xs leading-relaxed">
                    {m.definition}
                  </span>
                </div>
                {m.example && (
                  <div className="text-muted-foreground text-[9px] md:text-[11px] mt-0.5 md:mt-1 pl-1 md:pl-2 border-l-2 border-muted italic break-words">
                    "{m.example}"
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
