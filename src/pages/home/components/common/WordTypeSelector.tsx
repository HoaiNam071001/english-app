import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TYPE_COLORS } from "@/constants";
import { useWordTypes } from "@/hooks/useWordTypes";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import React, { useMemo } from "react";

interface WordTypeSelectorProps {
  value: string[] | null | undefined;
  onChange: (value: string[]) => void;
  className?: string;
}

const WordTypeSelector: React.FC<WordTypeSelectorProps> = ({
  value = [],
  onChange,
  className,
}) => {
  const { types } = useWordTypes();

  const selectedIds = useMemo(() => {
    const validIds = new Set(types.map((t) => t.id));
    const filteredValue = (value || []).filter((id) => validIds.has(id));
    return new Set(filteredValue);
  }, [value, types]);

  const toggleType = (typeId: string) => {
    const newIds = new Set(selectedIds);
    if (newIds.has(typeId)) {
      newIds.delete(typeId);
    } else {
      newIds.add(typeId);
    }
    onChange(Array.from(newIds));
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra cha (PopoverTrigger) làm mở dropdown
    onChange([]);
  };

  const selectedTypes = types.filter((t) => selectedIds.has(t.id));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={`w-full justify-between h-auto min-h-[2rem] px-3 py-1 font-normal text-left ${className}`}
        >
          {/* Khu vực hiển thị Tags */}
          <div className="flex flex-wrap gap-1 items-center flex-1 mr-2">
            {selectedTypes.length > 0 ? (
              selectedTypes.map((type) => {
                const colorObj =
                  TYPE_COLORS.find((c) => c.id === type.color) ||
                  TYPE_COLORS[0];
                return (
                  <div
                    key={type.id}
                    className={cn(
                      `flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium border bg-opacity-50`,
                      colorObj.badge
                    )}
                  >
                    {type.name}
                  </div>
                );
              })
            ) : (
              <span className="text-muted-foreground text-sm">
                Select types...
              </span>
            )}
          </div>

          {/* Khu vực Icons bên phải */}
          <div className="flex items-center gap-1 shrink-0">
            {selectedIds.size > 0 && (
              <div
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-sm hover:bg-accent transition-colors"
              >
                <X size={14} />
              </div>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0" align="start">
        <ScrollArea className="h-[200px]">
          <div className="p-1 space-y-1">
            {types.map((type) => {
              const isSelected = selectedIds.has(type.id);
              const colorObj =
                TYPE_COLORS.find((c) => c.id === type.color) || TYPE_COLORS[0];
              return (
                <div
                  key={type.id}
                  onClick={() => toggleType(type.id)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer text-sm transition-colors
                    ${
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${colorObj.bg}`} />
                  <span className="flex-1 truncate text-xs">{type.name}</span>
                  {isSelected && <Check size={14} className="opacity-70" />}
                </div>
              );
            })}
            {types.length === 0 && (
              <div className="text-xs text-center py-4 text-muted-foreground">
                No types defined.
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default WordTypeSelector;
