import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PartOfSpeech } from "@/types";
import { ChevronDown } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

interface PartOfSpeechSelectorProps {
  value: PartOfSpeech[] | null | undefined;
  onChange: (value: PartOfSpeech[]) => void;
  className?: string;
}

const PartOfSpeechSelector: React.FC<PartOfSpeechSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  const { t } = useTranslation("home");

  const togglePos = (pos: PartOfSpeech) => {
    const current = value || [];
    if (current.includes(pos)) {
      onChange(current.filter((p) => p !== pos));
    } else {
      onChange([...current, pos]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={`w-full justify-between h-8 px-2 text-left font-normal ${className || ""}`}
        >
          <span className="truncate text-xs">
            {value && value.length > 0 ? (
              <span className="text-foreground font-medium">
                {value.join(", ")}
              </span>
            ) : (
              <span className="text-muted-foreground italic">
                {t("edit.selectType")}
              </span>
            )}
          </span>
          <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[280px]" align="start">
        <ScrollArea className="h-[200px]">
          {Object.values(PartOfSpeech).map((pos) => (
            <div
              key={pos}
              className="flex items-center space-x-2 p-1.5 hover:bg-accent cursor-pointer rounded-sm"
              onClick={() => togglePos(pos)}
            >
              <Checkbox
                checked={!!value?.includes(pos)}
                className="h-3.5 w-3.5"
              />
              <span className="text-xs">{pos}</span>
            </div>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PartOfSpeechSelector;
