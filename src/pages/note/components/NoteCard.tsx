import NizEditor from "@/components/NizEditor";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NoteModel } from "@/types";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface NoteCardProps {
  note: NoteModel;
  layout: "grid" | "list";
  onEdit: (note: NoteModel) => void;
  onView: (note: NoteModel) => void;
  onDelete: (id: string) => void;
  forceExpand?: boolean;
}

export const NoteCard = ({
  note,
  layout,
  onEdit,
  onView,
  onDelete,
  forceExpand,
}: NoteCardProps) => {
  const isGrid = layout === "grid";
  // [NEW] State local để collapse/expand từng item
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync state with forceExpand prop from parent
  useEffect(() => {
    if (forceExpand !== undefined) {
      setIsExpanded(forceExpand);
    }
  }, [forceExpand]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const CardActions = () => (
    <div className="flex gap-1">
      {/* Desktop Hover Actions */}
      <div
        className={`opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 backdrop-blur-sm p-1 border rounded-lg bg-background/50`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(note);
          }}
          title="Edit"
        >
          <Edit2 size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          title="Delete"
        >
          <Trash2 size={16} />
        </Button>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(note)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(note.id)}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div
      onClick={() => onView(note)}
      className={`
        group relative bg-card border border-border/60 hover:border-primary/50
        transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer overflow-hidden
        flex flex-col gap-3
        ${isGrid ? "rounded-xl px-4 py-3 h-full" : "rounded-lg px-4 py-3"}
      `}
    >
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {CardActions()}
      </div>

      {/* === HEADER SECTION === */}
      <div className="flex justify-between items-start pr-20">
        {!isGrid && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-muted mr-2"
            onClick={toggleExpand}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        )}
        {/* pr-20 để tránh đè action buttons */}
        <div className="flex w-full flex-col">
          <div
            className={`font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 ${
              isGrid ? "text-lg" : "text-base"
            }`}
          >
            {note.title}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-1">
            <Calendar size={12} />
            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* === CONTENT SECTION === */}
      {/* Logic hiển thị:
          - Grid: Luôn hiện content (với fixed height)
          - List: Chỉ hiện khi isExpanded = true
      */}
      {(isGrid || isExpanded) && (
        <div
          className={cn(
            "text-sm overflow-hidden border rounded-lg bg-background animate-in fade-in zoom-in-95 duration-200",
            isGrid ? "h-[80px]" : "min-h-[60px]"
          )}
        >
          {note.content ? (
            <div className="overflow-hidden">
              <NizEditor markdown={note.content} viewMode={true} />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground p-4">
              <span>No content preview</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
