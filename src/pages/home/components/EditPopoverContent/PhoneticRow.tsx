import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccentType, PhoneticItem } from "@/types";
import { playAudio } from "@/utils/audio"; // Import hàm vừa viết
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Edit2, LinkIcon, Volume2 } from "lucide-react";
import { useState } from "react";

const VALID_ACCENTS = [AccentType.US, AccentType.UK, AccentType.AU];

export const PhoneticRow = ({
  item,
  wordText,
  onUpdate,
  onDelete,
}: {
  item: PhoneticItem;
  wordText: string;
  onUpdate: (item: PhoneticItem) => void;
  onDelete: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(!item.text);
  const [editForm, setEditForm] = useState(item);

  // --- HÀM CALL AUDIO ---
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playAudio(item.audio, wordText, item.accent);
  };

  const hasAudio = (item.audio && item.audio.trim() !== "") || item.text;

  // const handleAutoFillAudio = (type: AccentType) => {
  //   // Dùng hàm get link từ file utils
  //   const link = getGoogleAudioLink(wordText || "", type);
  //   if (link) {
  //     setEditForm({
  //       ...editForm,
  //       accent: type,
  //       audio: link,
  //     });
  //   }
  // };

  // 1. CHẾ ĐỘ EDIT
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
            <DropdownMenuContent className="bg-popover text-popover-foreground border rounded-md shadow-md p-1 min-w-[80px] z-50">
              {VALID_ACCENTS.map((acc) => (
                <DropdownMenuItem
                  key={acc}
                  className="text-xs px-2 py-1.5 outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
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

        {/* Audio Input Row */}
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

          {/* Auto Fill Buttons */}
          {/* <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="h-7 px-2 text-[10px] text-muted-foreground hover:text-primary whitespace-nowrap"
              onClick={() => handleAutoFillAudio(AccentType.US)}
              title="Auto generate US Link"
            >
              <Wand2 size={10} className="mr-1" /> US
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="h-7 px-2 text-[10px] text-muted-foreground hover:text-primary whitespace-nowrap"
              onClick={() => handleAutoFillAudio(AccentType.UK)}
              title="Auto generate UK Link"
            >
              <Wand2 size={10} className="mr-1" /> UK
            </Button>
          </div> */}
        </div>

        {/* Actions Row */}
        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] hover:bg-destructive hover:text-white"
            onClick={() => {
              if (!item.text) onDelete();
              else setIsEditing(false);
            }}
          >
            {item.text ? "Cancel" : "Discard"}
          </Button>
          <Button
            size="sm"
            className="h-6 px-3 text-[10px]"
            onClick={() => {
              onUpdate(editForm);
              setIsEditing(false);
            }}
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  // 2. CHẾ ĐỘ VIEW
  return (
    <div className="group flex items-center justify-between p-1 rounded-md border border-transparent hover:border-border hover:bg-accent/5 transition-all">
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="text-[9px] px-1 h-4 rounded-sm uppercase text-muted-foreground"
        >
          {item.accent}
        </Badge>

        <span className="text-xs font-mono font-medium text-foreground">
          {item.text}
        </span>

        {/* Nút Loa */}
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

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => {
          setEditForm(item);
          setIsEditing(true);
        }}
      >
        <Edit2 size={12} className="text-muted-foreground" />
      </Button>
    </div>
  );
};
