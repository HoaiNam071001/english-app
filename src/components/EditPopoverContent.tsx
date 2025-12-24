import { VocabularyItem } from "@/types";
import { Label } from "@radix-ui/react-label";
import { Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface EditPopoverContentProps {
  word: VocabularyItem;
  onSave: (id: string, text: string, meaning: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const EditPopoverContent: React.FC<EditPopoverContentProps> = ({
  word,
  onSave,
  onDelete,
  onClose,
}) => {
  const [form, setForm] = useState({ text: word.text, meaning: word.meaning });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onSave(word.id, form.text, form.meaning);
    onClose();
  };

  if (showDeleteConfirm) {
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-red-600">
          Xác nhận xóa từ này?
        </h4>
        <p className="text-xs text-slate-500">
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDelete(word.id);
              onClose();
            }}
          >
            Xóa
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Chỉnh sửa</h4>
        <p className="text-xs text-muted-foreground">
          Cập nhật thông tin từ vựng.
        </p>
      </div>
      <div className="grid gap-2">
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="text">Từ vựng</Label>
          <Input
            id="text"
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            className="col-span-2 h-8"
          />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="meaning">Nghĩa</Label>
          <Input
            id="meaning"
            value={form.meaning}
            onChange={(e) => setForm({ ...form, meaning: e.target.value })}
            className="col-span-2 h-8"
          />
        </div>
      </div>
      <div className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 size={14} />
        </Button>
        <Button size="sm" onClick={handleSave}>
          <Save size={14} className="mr-1" /> Lưu
        </Button>
      </div>
    </div>
  );
};
