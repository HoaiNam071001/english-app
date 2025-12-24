import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea cho ví dụ
import { VocabularyItem } from "@/types";
import { Save, Trash2 } from "lucide-react";
import React, { useState } from "react";

interface EditPopoverContentProps {
  word: VocabularyItem;
  onSave: (id: string, updates: Partial<VocabularyItem>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const EditPopoverContent: React.FC<EditPopoverContentProps> = ({
  word,
  onSave,
  onDelete,
  onClose,
}) => {
  // State form chứa các field có thể edit
  const [form, setForm] = useState({
    text: word.text,
    meaning: word.meaning,
    example: word.example || "", // Field mới
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    // Truyền thẳng object form (nó khớp với Partial<VocabularyItem>)
    onSave(word.id, form);
    onClose();
  };

  if (showDeleteConfirm) {
    return (
      <div className="space-y-3 w-60">
        <h4 className="font-medium text-sm text-red-600">
          Confirm deletion of this word?
        </h4>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDelete(word.id);
              onClose();
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 w-80">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Edit</h4>
        <p className="text-xs text-muted-foreground">
          Update vocabulary information.
        </p>
      </div>

      <div className="grid gap-3">
        {/* Input Từ vựng */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="text" className="text-right text-xs">
            Value
          </Label>
          <Input
            id="text"
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            className="col-span-3 h-8 text-sm"
          />
        </div>

        {/* Input Nghĩa */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="meaning" className="text-right text-xs">
            Meaning
          </Label>
          <Input
            id="meaning"
            value={form.meaning}
            onChange={(e) => setForm({ ...form, meaning: e.target.value })}
            className="col-span-3 h-8 text-sm"
          />
        </div>

        {/* Input Ví dụ (Mới) */}
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="example" className="text-right text-xs mt-2">
            Note
          </Label>
          <Textarea
            id="example"
            value={form.example}
            onChange={(e) => setForm({ ...form, example: e.target.value })}
            className="col-span-3 text-sm min-h-[60px]"
            placeholder="Đặt câu ví dụ..."
          />
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 size={14} />
        </Button>
        <Button size="sm" className="!px-3" onClick={handleSave}>
          <Save size={14} className="mr-1" /> Save
        </Button>
      </div>
    </div>
  );
};
