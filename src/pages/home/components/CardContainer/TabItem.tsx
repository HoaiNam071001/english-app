import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabSession } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

interface TabItemProps {
  tab: TabSession;
  isActive: boolean;
  isEditing: boolean;
  disableClose: boolean;
  onActivate: () => void;
  onClose: (e: React.MouseEvent) => void;
  onEditStart: () => void;
  onEditSave: (newTitle: string) => void;
  onEditCancel: () => void;
}

export const TabItem = ({
  tab,
  isActive,
  isEditing,
  disableClose,
  onActivate,
  onClose,
  onEditStart,
  onEditSave,
  onEditCancel,
}: TabItemProps) => {
  const [tempTitle, setTempTitle] = useState(tab.title);
  useEffect(() => {
    setTempTitle(tab.title);
  }, [tab.title, isEditing]);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEditSave(tempTitle);
    }
  };
  return (
    <div
      onClick={onActivate}
      className={`h-full group flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg cursor-pointer border-t border-x transition-all select-none min-w-[120px] max-w-[200px] shrink-0 ${
        isActive
          ? "bg-muted/30 border-border text-foreground relative -mb-[1px] border-b-transparent z-10 shadow-sm"
          : "bg-transparent border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      <Popover
        open={isEditing}
        onOpenChange={(isOpen) => {
          if (!isOpen) onEditCancel();
        }}
      >
        <PopoverTrigger asChild>
          <span
            className="truncate flex-1"
            onDoubleClick={(e) => {
              e.stopPropagation();
              onEditStart();
            }}
            title="Double click to rename"
          >
            {tab.title}
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="w-64 p-2 bg-card shadow-lg rounded-lg"
          align="start"
          sideOffset={-10}
        >
          <div className="flex items-center gap-2">
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8 text-sm"
              placeholder="Session name"
              autoFocus
            />
            <Button
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onEditSave(tempTitle)}
            >
              <Check size={14} />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <span className="text-[10px] bg-muted-foreground/10 px-1.5 rounded-full min-w-[1.5rem] text-center flex-shrink-0">
        {tab.wordIds.length}
      </span>
      {!disableClose && (
        <div
          onClick={onClose}
          className="md:opacity-0 md:group-hover:opacity-100 p-0.5 rounded-full md:hover:bg-destructive/10 md:hover:text-destructive transition-all flex-shrink-0"
        >
          <X size={12} />
        </div>
      )}
    </div>
  );
};
