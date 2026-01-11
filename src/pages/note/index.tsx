import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STORAGE_KEY } from "@/constants";
import { useConfirm } from "@/hooks/useConfirm";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useNotes } from "@/hooks/useNotes";
import { NoteModel } from "@/types";
import {
  CalendarDays,
  ChevronsDown,
  ChevronsUp,
  Layers,
  LayoutGrid,
  List as ListIcon,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NoteCard } from "./components/NoteCard";
import { NoteEditorModal } from "./components/NoteEditorModal";

type LayoutType = "grid" | "list";

const NotePage = () => {
  // --- STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteModel | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [globalExpandState, setGlobalExpandState] = useState<
    boolean | undefined
  >(undefined);
  // View Settings
  const { getStorage, setStorage } = useLocalStorage();

  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState<LayoutType>(
    getStorage(STORAGE_KEY.NOTE_LAYOUT) || "grid"
  );
  const [isGrouped, setIsGrouped] = useState(
    getStorage(STORAGE_KEY.NOTE_GROUPED) || false
  );
  const { confirm } = useConfirm();
  // Hook Data
  const {
    notes,
    loading,
    hasMore,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes();

  // --- EFFECTS ---
  useEffect(() => {
    if (!isGrouped) return;
    setStorage(STORAGE_KEY.NOTE_GROUPED, layout);
  }, [isGrouped]);
  useEffect(() => {
    if (!layout) return;
    setStorage(STORAGE_KEY.NOTE_LAYOUT, layout);
  }, [layout]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes(searchQuery, false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchNotes]);

  // --- LOGIC GROUPING ---
  const groupedNotes = useMemo(() => {
    if (!isGrouped) return { "All Notes": notes };

    const groups: Record<string, NoteModel[]> = {};
    const now = new Date();
    const todayStr = now.toLocaleDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();

    notes.forEach((note) => {
      const date = new Date(note.updatedAt).toLocaleDateString();
      let groupKey = date;

      if (date === todayStr) groupKey = "Today";
      else if (date === yesterdayStr) groupKey = "Yesterday";

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(note);
    });

    return groups;
  }, [notes, isGrouped]);

  // --- HANDLERS ---
  const handleCreateNew = () => {
    setSelectedNote(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (note: NoteModel) => {
    setSelectedNote(note);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleView = (note: NoteModel) => {
    setSelectedNote(note);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Delete Note?",
      message:
        "Are you sure you want to delete this note? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (isConfirmed) {
      deleteNote(id);
    }
  };

  const handleSaveNote = async (id: string, noteData: Partial<NoteModel>) => {
    if (id) {
      await updateNote(id, {
        title: noteData.title,
        content: noteData.content,
      });
    } else {
      await createNote({
        title: noteData.title,
        content: noteData.content,
      });
    }
    setIsModalOpen(false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotes(searchQuery, true);
    }
  };

  const toggleExpandAll = () => {
    // Logic toggle: Nếu đang undefined hoặc false -> set true. Nếu true -> set false.
    setGlobalExpandState((prev) => !prev);
  };

  return (
    <div className="bg-background text-foreground font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-xl font-bold tracking-tight mb-1 text-foreground/90">
            My Knowledge Base
          </div>
          <p className="text-muted-foreground text-sm">
            Capture ideas, organize thoughts, and create everywhere.
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="h-10 px-6 shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-2" /> New Note
        </Button>
      </div>

      {/* TOOLBAR SECTION */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-4 border-b mb-6">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          {/* Search Bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              size={16}
            />
            <Input
              className="pl-9 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-all"
              placeholder="Search by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {layout === "list" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleExpandAll}
                  className="gap-2 text-xs font-medium h-9 text-muted-foreground hover:text-foreground"
                  title={globalExpandState ? "Collapse All" : "Expand All"}
                >
                  {globalExpandState ? (
                    <>
                      <ChevronsUp size={16} />{" "}
                      <span className="hidden sm:inline">Collapse All</span>
                    </>
                  ) : (
                    <>
                      <ChevronsDown size={16} />{" "}
                      <span className="hidden sm:inline">Expand All</span>
                    </>
                  )}
                </Button>
                <div className="w-[1px] h-6 bg-border mx-1"></div>
              </>
            )}

            {/* Group Toggle */}
            <Button
              variant={isGrouped ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setIsGrouped(!isGrouped)}
              className="gap-2 text-xs font-medium h-9"
              title="Group by Date"
            >
              <CalendarDays size={16} />
              <span className="hidden sm:inline">
                {isGrouped ? "Grouped" : "No Group"}
              </span>
            </Button>

            <div className="w-[1px] h-6 bg-border mx-1"></div>

            {/* Layout Toggle */}
            <div className="flex bg-muted/50 p-1 rounded-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLayout("grid")}
                className={`h-7 w-7 rounded-sm transition-all ${
                  layout === "grid"
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLayout("list")}
                className={`h-7 w-7 rounded-sm transition-all ${
                  layout === "list"
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="List View"
              >
                <ListIcon size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      {loading && notes.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-muted-foreground">Syncing your notes...</p>
        </div>
      ) : (
        <div className="space-y-8 pb-20">
          {Object.entries(groupedNotes).map(([groupName, groupNotes]) => (
            <div
              key={groupName}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {/* Group Header (Only show if Grouped or if multiple groups exist) */}
              {(isGrouped || Object.keys(groupedNotes).length > 1) &&
                groupNotes.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Layers size={14} /> {groupName}
                    </h2>
                    <div className="h-[1px] flex-1 bg-border/50"></div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {groupNotes.length}
                    </span>
                  </div>
                )}

              {/* Grid/List Render */}
              <div
                className={
                  layout === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                    : "flex flex-col gap-3"
                }
              >
                {groupNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    layout={layout}
                    forceExpand={globalExpandState}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {notes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-muted rounded-xl bg-muted/5">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Search size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No notes found</h3>
              <p className="text-muted-foreground max-w-sm mt-1 mb-6">
                {searchQuery
                  ? `We couldn't find anything matching "${searchQuery}"`
                  : "Get started by creating your first note."}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateNew} variant="outline">
                  Create Note
                </Button>
              )}
            </div>
          )}

          {/* Load More */}
          {hasMore && notes.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                disabled={loading}
                className="min-w-[140px]"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Load older notes"
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      <NoteEditorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        note={selectedNote}
        onSave={(update) => handleSaveNote(selectedNote?.id, update)}
        isViewMode={isViewMode}
      />
    </div>
  );
};

export default NotePage;
