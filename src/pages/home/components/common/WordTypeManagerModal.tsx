import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TYPE_COLORS } from "@/constants";
import { useWordTypes } from "@/hooks/useWordTypes";
import { cn } from "@/lib/utils";
import { WordType } from "@/types";
import { Check, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";

// --- 1. Component Item Riêng Biệt (Xử lý Edit Inline) ---
interface WordTypeItemProps {
  type: WordType;
  onUpdate: (
    id: string,
    data: { name: string; color: string }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const WordTypeItem = ({ type, onUpdate, onDelete }: WordTypeItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(type.name);
  const [editColor, setEditColor] = useState(type.color);
  const [isSaving, setIsSaving] = useState(false);

  // Reset state khi mở edit hoặc khi props thay đổi
  const handleStartEdit = () => {
    setEditName(type.name);
    setEditColor(type.color);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      await onUpdate(type.id, { name: editName, color: editColor });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update", error);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Render Giao diện EDIT ---
  if (isEditing) {
    return (
      <div className="p-3 rounded-lg border bg-accent/30 space-y-3 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex gap-2">
          <div className="relative flex-1">
            {/* Color Dot Indicator inside Input */}
            <div
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-sm ring-1 ring-inset ring-black/10 transition-colors",
                TYPE_COLORS.find((c) => c.id === editColor)?.bg ||
                  "bg-slate-500"
              )}
            />
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="pl-9 h-9 bg-background"
              placeholder="Type name..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setIsEditing(false);
              }}
            />
          </div>
          <Button
            size="icon"
            variant="default"
            onClick={handleSave}
            disabled={isSaving || !editName.trim()}
            className="h-9 w-9 shrink-0 bg-green-600 hover:bg-green-700 text-white"
          >
            <Check size={16} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
            className="h-9 w-9 shrink-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Mini Color Palette for Edit */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {TYPE_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setEditColor(c.id)}
              className={cn(
                "w-5 h-5 rounded-full border transition-all hover:scale-110",
                c.bg,
                editColor === c.id
                  ? "ring-2 ring-offset-1 ring-offset-background ring-foreground border-transparent scale-110"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
              title={c.id}
            />
          ))}
        </div>
      </div>
    );
  }

  // --- Render Giao diện VIEW (Mặc định) ---
  const colorObj =
    TYPE_COLORS.find((c) => c.id === type.color) || TYPE_COLORS[0];

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-accent-foreground/20 transition-all group">
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${colorObj.bg} shadow-sm ring-1 ring-inset ring-black/10`}
        />
        <span className="text-sm font-medium text-foreground">{type.name}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={handleStartEdit}
        >
          <Pencil size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(type.id)}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};

// --- 2. Main Modal Component ---
interface WordTypeManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WordTypeManagerModal = ({
  open,
  onOpenChange,
}: WordTypeManagerModalProps) => {
  // Đảm bảo hook useWordTypes của bạn export function `updateType`
  const { types, addType, deleteType, updateType, loading } = useWordTypes();

  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    TYPE_COLORS[0]?.id || "slate"
  );

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addType({
      name: newName,
      color: selectedColor,
    });
    setNewName("");
    // Reset về màu mặc định hoặc giữ nguyên tùy UX bạn muốn
    setSelectedColor(TYPE_COLORS[0]?.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden outline-none">
        {/* Header */}
        <div className="p-6 pb-4 border-b bg-background/50 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Manage Word Types
            </DialogTitle>
            <DialogDescription>
              Define categories to organize your vocabulary.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Create New Section */}
        <div className="p-6 py-4 bg-muted/30 space-y-4">
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Create New Type
            </Label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <div
                  className={cn(
                    `absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border shadow-sm transition-colors`,
                    TYPE_COLORS.find((c) => c.id === selectedColor)?.bg
                  )}
                />
                <Input
                  placeholder="Type name (e.g. Noun)..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="pl-9 bg-background focus-visible:ring-offset-0"
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={loading || !newName}
                size="icon"
                className="shrink-0"
              >
                <Plus size={18} />
              </Button>
            </div>

            {/* Main Color Palette */}
            <div className="flex flex-wrap gap-2 pt-1">
              {TYPE_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className={cn(
                    "group relative w-6 h-6 rounded-full border transition-all duration-200",
                    c.bg,
                    selectedColor === c.id
                      ? "scale-110 shadow-sm ring-2 ring-offset-2 ring-offset-background ring-foreground border-transparent"
                      : "border-transparent hover:scale-110 hover:shadow-sm opacity-80 hover:opacity-100"
                  )}
                  title={c.id}
                >
                  {selectedColor === c.id && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check
                        size={12}
                        className="text-white dark:text-black/80 drop-shadow-sm"
                        strokeWidth={3}
                      />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* List Section */}
        <div className="p-6 pt-4 bg-background">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
            Existing Types ({types.length})
          </Label>

          <ScrollArea className="h-[240px] -mr-4 pr-4">
            <div className="space-y-2 pb-4">
              {types.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[150px] text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                  <Tag size={32} className="opacity-20 mb-2" />
                  <p className="text-sm">No types created yet.</p>
                </div>
              )}

              {types.map((type) => (
                <WordTypeItem
                  key={type.id}
                  type={type}
                  onUpdate={updateType}
                  onDelete={deleteType}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
