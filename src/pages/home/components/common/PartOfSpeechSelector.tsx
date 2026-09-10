import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PartOfSpeech } from "@/types";
import {
  getPartOfSpeechSolidStyle,
  getPartOfSpeechStyle,
  getShortPartOfSpeech,
} from "@/utils";
import React from "react";

interface PartOfSpeechSelectorProps {
  value: PartOfSpeech[] | null | undefined;
  onChange: (value: PartOfSpeech[]) => void;
  className?: string;
}

const ALL_POS = Object.values(PartOfSpeech);

// Mỗi từ loại là một nút bấm hiển thị sẵn: click để chọn/bỏ chọn,
// hoặc Tab để rê qua từng nút rồi Enter/Space để chọn (hành vi mặc định của <button>).
const PartOfSpeechSelector: React.FC<PartOfSpeechSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  const selected = value || [];

  const togglePos = (pos: PartOfSpeech) => {
    if (selected.includes(pos)) {
      onChange(selected.filter((p) => p !== pos));
    } else {
      onChange([...selected, pos]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-0.5", className)}>
      {ALL_POS.map((pos) => {
        const isSelected = selected.includes(pos);
        return (
          <button
            key={pos}
            type="button"
            title={pos}
            aria-pressed={isSelected}
            onClick={() => togglePos(pos)}
            className={cn(
              "px-1 h-4.5 min-w-4.5 rounded-sm border text-[9px] font-bold uppercase tracking-tighter leading-none transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isSelected
                ? cn(getPartOfSpeechSolidStyle(pos), "border-transparent")
                : cn(getPartOfSpeechStyle(pos), "opacity-60 hover:opacity-100")
            )}
          >
            {getShortPartOfSpeech(pos)}
          </button>
        );
      })}
    </div>
  );
};

// Nút "!" đặt cạnh label, bấm vào để xem chú giải mỗi nút viết tắt là từ loại gì.
export const PartOfSpeechLegend: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Part of speech legend"
          className={cn(
            "w-3.5 h-3.5 shrink-0 rounded-full border border-muted-foreground/40 text-muted-foreground text-[9px] leading-none flex items-center justify-center hover:bg-accent hover:text-foreground transition-colors",
            className
          )}
        >
          !
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          {ALL_POS.map((pos) => (
            <div key={pos} className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "w-11 shrink-0 text-center px-1 rounded text-[9px] font-bold uppercase border whitespace-nowrap",
                  getPartOfSpeechStyle(pos)
                )}
              >
                {getShortPartOfSpeech(pos)}
              </span>
              <span className="capitalize text-foreground">{pos}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PartOfSpeechSelector;
