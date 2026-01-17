import { CommonModal } from "@/components/CommonModal"; // Giả định component modal của bạn
import NizEditor from "@/components/NizEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NoteModel } from "@/types";
import { Calendar, Eye, FileText } from "lucide-react";
import React, { useEffect, useState } from "react";

interface NoteEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: NoteModel | null;
  onSave: (note: Partial<NoteModel>) => void;
  isViewMode?: boolean;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  open,
  onOpenChange,
  note,
  onSave,
  isViewMode = false,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Reset/Fill dữ liệu khi mở modal
  useEffect(() => {
    if (open) {
      if (note) {
        setTitle(note.title);
        setContent(note.content);
      } else {
        setTitle("");
        setContent("");
      }
    }
  }, [note, open]);

  const handleConfirmSave = () => {
    if (isViewMode) return;

    const notePayload: Partial<NoteModel> = {
      title: title.trim() || "",
      content: content,
    };

    onSave(notePayload);
  };

  return (
    <CommonModal
      open={open}
      onOpenChange={onOpenChange}
      closeOnInteractOutside={isViewMode ? true : false}
      title={
        <div className="flex items-center gap-2 text-foreground">
          {isViewMode ? (
            <Eye size={20} className="text-blue-500" />
          ) : (
            <FileText size={20} className="text-primary" />
          )}
          <span className="font-semibold">
            {isViewMode
              ? "View Details"
              : note
                ? "Edit Note"
                : "Create New Note"}
          </span>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3 pt-2 border-t mt-4 ">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button
              onClick={handleConfirmSave}
              disabled={!title}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {note ? "Update Note" : "Save Note"}
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-5 mt-1 w-full md:w-[700px]">
        {/* INFO BAR: Chỉ hiện khi có note (Edit/View) */}
        {note && (
          <div className="flex flex-wrap gap-3 select-none">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
              <Calendar size={12} />
              <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
              <Calendar size={12} />
              <span>Updated: {new Date(note.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* INPUT TITLE */}
        <div className="grid gap-2">
          {!isViewMode && (
            <Label htmlFor="title" className="text-sm font-semibold ml-1">
              Title
            </Label>
          )}
          {isViewMode ? (
            <div className="font-semibold text-lg">{title}</div>
          ) : (
            <Input
              id="title"
              placeholder="Enter note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isViewMode}
              className={`text-lg font-bold transition-all ${
                isViewMode
                  ? "border-none bg-transparent px-0 shadow-none text-2xl cursor-text opacity-100"
                  : "focus-visible:ring-primary"
              }`}
            />
          )}
        </div>

        {/* MARKDOWN EDITOR */}
        <div className="grid gap-2 flex-1 min-h-0">
          {!isViewMode && (
            <Label className="text-sm font-semibold ml-1">Content</Label>
          )}
          <div
            className={`transition-all max-h-[400px] overflow-auto ${
              isViewMode
                ? "bg-background"
                : "border rounded-lg bg-card shadow-sm overflow-hidden ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
            }`}
          >
            <NizEditor
              markdown={content}
              onChange={setContent}
              viewMode={isViewMode}
            />
          </div>
        </div>
      </div>
    </CommonModal>
  );
};
