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
import { Check, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";

interface WordTypeManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WordTypeManagerModal = ({
  open,
  onOpenChange,
}: WordTypeManagerModalProps) => {
  const { types, addType, deleteType, loading } = useWordTypes();
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Manage Word Types
            </DialogTitle>
            <DialogDescription>
              Define categories like Noun, Verb, Adjective to organize your
              vocabulary.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Create New Section */}
        <div className="p-6 py-4 bg-muted/30 space-y-4">
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Create New Type
            </Label>

            {/* Input Group */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div
                  className={cn(
                    `absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border shadow-sm `,
                    TYPE_COLORS.find((c) => c.id === selectedColor)?.bg
                  )}
                />
                <Input
                  placeholder="Type name (e.g. Noun)..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="pl-9 bg-background"
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

            {/* Color Palette */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Select Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {TYPE_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    className={`
                      group relative w-6 h-6 rounded-full ${c.bg}
                      border transition-all duration-200
                      ${
                        selectedColor === c.id
                          ? "border-orange-500 scale-110 shadow-sm ring-1 ring-offset-2 ring-offset-background ring-orange-500"
                          : "border-transparent hover:scale-110 hover:shadow-sm"
                      }
                    `}
                    title={c.id}
                  >
                    {selectedColor === c.id && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check
                          size={12}
                          className="text-foreground/80 drop-shadow-sm"
                          strokeWidth={3}
                        />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* List Section */}
        <div className="p-6 pt-4">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
            Existing Types ({types.length})
          </Label>

          <ScrollArea className="h-[220px] -mr-4 pr-4">
            <div className="space-y-2">
              {types.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[150px] text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                  <Tag size={32} className="opacity-20 mb-2" />
                  <p className="text-sm">No types created yet.</p>
                </div>
              )}

              {types.map((type) => {
                const colorObj =
                  TYPE_COLORS.find((c) => c.id === type.color) ||
                  TYPE_COLORS[0];
                return (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-accent-foreground/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${colorObj.bg} shadow-sm ring-1 ring-inset ring-black/10`}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {type.name}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                      onClick={() => deleteType(type.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
