// ----------------------------------------------------------------------
const VALID_ACCENTS = [AccentType.US, AccentType.UK, AccentType.AU];

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccentType, PhoneticItem } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Edit2, LinkIcon, Volume2 } from "lucide-react";
import { useState } from "react";

// ----------------------------------------------------------------------
export const PhoneticRow = ({
  item,
  onUpdate,
  onDelete,
}: {
  item: PhoneticItem;
  onUpdate: (item: PhoneticItem) => void;
  onDelete: () => void;
}) => {
  // Tự động vào chế độ edit nếu mới tạo (text rỗng)
  const [isEditing, setIsEditing] = useState(!item.text);
  const [editForm, setEditForm] = useState(item);

  // Play audio logic
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.audio) new Audio(item.audio).play();
  };

  const hasAudio = item.audio && item.audio.trim() !== "";

  // 1. Chế độ Edit (Chiếm không gian để nhập liệu)
  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 p-2 border rounded-md bg-accent/10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-1.5">
          {/* Accent Select */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-1.5 text-[10px] uppercase font-bold min-w-[36px]"
              >
                {editForm.accent}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {VALID_ACCENTS.map((acc) => (
                <DropdownMenuItem
                  key={acc}
                  onClick={() => setEditForm({ ...editForm, accent: acc })}
                >
                  {acc}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Text Input */}
          <Input
            value={editForm.text}
            onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
            className="h-7 text-xs font-mono flex-1"
            placeholder="/ipa/"
            autoFocus
          />
        </div>

        {/* Audio Input */}
        <div className="flex items-center gap-1.5">
          <LinkIcon size={12} className="text-muted-foreground shrink-0" />
          <Input
            value={editForm.audio || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, audio: e.target.value })
            }
            className="h-7 text-[10px] px-1.5 flex-1"
            placeholder="https://..."
          />
        </div>

        {/* Actions Row */}
        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] hover:bg-destructive hover:text-white"
            onClick={() => {
              setIsEditing(false);
              onDelete();
            }}
          >
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] hover:bg-destructive hover:text-white"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-6 px-3 text-[10px]"
            onClick={() => {
              onUpdate(editForm);
              setIsEditing(false);
            }}
          >
            OK
          </Button>
        </div>
      </div>
    );
  }

  // 2. Chế độ View (Siêu gọn)
  return (
    <div className="group flex items-center justify-between p-1 rounded-md border border-transparent hover:border-border hover:bg-accent/5 transition-all">
      <div className="flex items-center gap-2">
        {/* Badge Accent */}
        <Badge
          variant="secondary"
          className="text-[9px] px-1 h-4 rounded-sm uppercase text-muted-foreground"
        >
          {item.accent}
        </Badge>

        {/* Text IPA */}
        <span className="text-xs font-mono font-medium text-foreground">
          {item.text}
        </span>

        {/* Nút Loa (Chỉ hiện nếu có audio) */}
        {hasAudio && (
          <div
            className="p-1 text-blue-500 hover:text-blue-700 cursor-pointer transition-colors"
            onClick={handlePlay}
            title="Play Audio"
          >
            <Volume2 size={12} />
          </div>
        )}
      </div>

      {/* Nút Edit (Hiện khi hover row) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => {
          setEditForm(item); // Reset form về giá trị hiện tại
          setIsEditing(true);
        }}
      >
        <Edit2 size={12} className="text-muted-foreground" />
      </Button>
    </div>
  );
};
