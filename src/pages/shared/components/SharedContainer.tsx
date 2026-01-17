import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useSharedVocabulary } from "@/hooks/useSharedVocabulary";
import { useToast } from "@/hooks/useToast";
import { useVocabulary } from "@/hooks/useVocabulary";
import { VocabularyItem } from "@/types";
import { clonedVocabularyItem } from "@/utils/shareVocabulary";
import {
  CalendarDays,
  CheckSquare,
  Copy,
  Eye,
  EyeOff,
  Filter,
  FilterX, // Đổi icon sang Globe cho hợp ngữ cảnh Shared
  Loader2,
  Search,
  SquareDashedBottom,
  X,
} from "lucide-react";
import moment from "moment";
import "moment/locale/vi";
import { useEffect, useMemo, useState } from "react";
import { ConflictItem, ImportPreviewModal } from "./ImportPreviewModal";
import { SharedItem } from "./SharedItem";

moment.locale("vi");

const formatDateGroup = (dateString: string) => {
  const date = moment(dateString);
  if (!date.isValid()) return "Unknown Date";
  const now = moment();
  if (date.isSame(now, "day")) return "Today";
  if (date.isSame(now.clone().subtract(1, "days"), "day")) return "Yesterday";
  return date.format("dddd, DD/MM/YYYY");
};

export const SharedContainer = () => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { items, loading, hasMore, fetchNextSharedPage, totalCount } =
    useSharedVocabulary();
  const { allWords, addVocabulary, batchUpdateWords, fetchAllWords } =
    useVocabulary();
  const toast = useToast();

  const [hideExisting, setHideExisting] = useState(false);

  const userWordMap = useMemo(() => {
    return new Map(allWords.map((w) => [w.normalized, w]));
  }, [allWords]);

  useEffect(() => {
    if (userProfile?.id) {
      fetchAllWords(false);
    }
  }, [userProfile]);

  // --- STATE & LOGIC ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState<{
    newItems: VocabularyItem[];
    conflicts: ConflictItem[];
  }>({ newItems: [], conflicts: [] });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const displayItems = useMemo(() => {
    if (!hideExisting) return items;
    return items.filter((w) => !userWordMap.has(w.normalized));
  }, [items, hideExisting, userWordMap]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, VocabularyItem[]> = {};
    displayItems.forEach((word) => {
      const dateVal = word.createdAt || new Date().getTime();
      const dateKey = moment(dateVal).format("YYYY-MM-DD");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(word);
    });
    return groups;
  }, [displayItems]);

  const sortedDateKeys = useMemo(
    () => Object.keys(groupedItems).sort((a, b) => b.localeCompare(a)),
    [groupedItems],
  );

  const loadData = (isRefresh: boolean, keyword: string) => {
    if (isRefresh) {
      setSelectedIds(new Set());
      setLastSelectedId(null);
    }
    fetchNextSharedPage(20, isRefresh, keyword);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadData(true, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // --- HANDLERS (Giữ nguyên logic cũ) ---
  const handlePreImport = (wordsToImport: VocabularyItem[]) => {
    if (wordsToImport.length === 0) return;
    const existingMap = new Map(allWords.map((w) => [w.normalized, w]));
    const newItems: VocabularyItem[] = [];
    const conflicts: ConflictItem[] = [];

    wordsToImport.forEach((incoming) => {
      const norm = incoming.normalized || incoming.text.toLowerCase().trim();
      if (existingMap.has(norm)) {
        conflicts.push({
          existing: existingMap.get(norm)!,
          incoming: incoming,
        });
      } else {
        newItems.push(incoming);
      }
    });

    setImportData({ newItems, conflicts });
    setIsImportModalOpen(true);
  };

  const handleConfirmImport = async (
    itemsToAdd: VocabularyItem[],
    itemsToUpdate: { id: string; updates: Partial<VocabularyItem> }[],
  ) => {
    try {
      let addedCount = 0;
      let updatedCount = 0;
      if (itemsToAdd.length > 0) {
        const cleanItems = itemsToAdd.map(clonedVocabularyItem);
        const report = await addVocabulary(cleanItems);
        addedCount = report.added.length;
      }
      if (itemsToUpdate.length > 0) {
        await batchUpdateWords(itemsToUpdate);
        updatedCount = itemsToUpdate.length;
      }
      if (addedCount > 0 || updatedCount > 0) {
        toast.success(
          `Import successful: ${addedCount} added, ${updatedCount} updated.`,
        );
      } else {
        toast.info("No changes were made.");
      }
      setSelectedIds(new Set());
      setLastSelectedId(null);
    } catch (error) {
      console.error(error);
      toast.error("Import failed");
    }
  };

  const handleToggleSelect = (id: string, event: React.MouseEvent) => {
    const newSet = new Set(selectedIds);
    if (event.shiftKey && lastSelectedId) {
      const visibleIds = displayItems.map((w) => w.id);
      const lastIndex = visibleIds.indexOf(lastSelectedId);
      const currentIndex = visibleIds.indexOf(id);
      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeIds = visibleIds.slice(start, end + 1);
        rangeIds.forEach((rid) => newSet.add(rid));
      }
    } else if (event.ctrlKey || event.metaKey) {
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setLastSelectedId(id);
    } else {
      newSet.clear();
      newSet.add(id);
      setLastSelectedId(id);
    }
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === displayItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayItems.map((i) => i.id)));
    }
  };

  const handleSelectGroup = (dateKey: string) => {
    const itemsInGroup = groupedItems[dateKey] || [];
    const allSelected = itemsInGroup.every((i) => selectedIds.has(i.id));
    const newSet = new Set(selectedIds);
    if (allSelected) {
      itemsInGroup.forEach((i) => newSet.delete(i.id));
    } else {
      itemsInGroup.forEach((i) => newSet.add(i.id));
    }
    setSelectedIds(newSet);
  };

  const handleToggleReveal = (id: string) => {
    const newSet = new Set(revealedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setRevealedIds(newSet);
  };

  const isAllRevealed =
    displayItems.length > 0 && revealedIds.size >= displayItems.length;
  const toggleRevealAll = () => {
    if (isAllRevealed) {
      setRevealedIds(new Set());
    } else {
      setRevealedIds(new Set(displayItems.map((i) => i.id)));
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* ========================================
        NEW COMPACT HEADER
        ========================================
      */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b shadow-sm pt-4">
        <div className="pb-2">
          {/* ROW 1: Title & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Title Section */}
            <div>
              <h2 className="text-md font-bold leading-tight flex gap-2">
                Public Vocabulary Library
                <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                  {totalCount} words
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Browse collections shared by the community
              </p>
            </div>

            {/* Search Section */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search community..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 h-9 text-sm bg-muted/30 focus:bg-background transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* ROW 2: Toolbar & Hints */}
          <div className="flex items-center justify-between pt-1">
            {/* Left: Action Toolbar */}
            <div className="flex items-center gap-1">
              {/* Select All */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      {selectedIds.size === displayItems.length &&
                      displayItems.length > 0 ? (
                        <CheckSquare size={18} />
                      ) : (
                        <SquareDashedBottom size={18} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select All Visible</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Reveal All */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleRevealAll}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      {isAllRevealed ? <Eye size={18} /> : <EyeOff size={18} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle Meanings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Filter Existing */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={hideExisting ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setHideExisting(!hideExisting)}
                      className={`h-8 w-8 p-0 transition-all ${
                        hideExisting
                          ? "text-orange-600 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {hideExisting ? (
                        <FilterX size={18} />
                      ) : (
                        <Filter size={18} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {hideExisting ? "Show all words" : "Hide owned words"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Import Action (Visible when selected) */}
              {selectedIds.size > 0 && (
                <>
                  <div className="w-[1px] h-5 bg-border mx-1" />
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 gap-2 animate-in fade-in slide-in-from-left-2 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      const selectedItems = displayItems.filter((i) =>
                        selectedIds.has(i.id),
                      );
                      handlePreImport(selectedItems);
                    }}
                  >
                    <Copy size={14} />
                    <span>Import {selectedIds.size}</span>
                  </Button>
                </>
              )}
            </div>

            {/* Right: Hint Text */}
            <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground/70">
              <span className="flex items-center gap-1">
                <kbd className="bg-muted px-1 py-0.5 rounded border font-mono text-[10px]">
                  Ctrl
                </kbd>{" "}
                + Click to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-muted px-1 py-0.5 rounded border font-mono text-[10px]">
                  Shift
                </kbd>{" "}
                for range
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 pt-4">
        {loading && items.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground italic">
            <Loader2 className="h-8 w-8 animate-spin mb-2 opacity-20" />
            <p>Loading library...</p>
          </div>
        ) : (
          <div className="pb-20 space-y-6">
            {sortedDateKeys.length === 0 && !loading ? (
              <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/10">
                <Search className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground font-medium">
                  No words found
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {hideExisting
                    ? "Try turning off the 'Hide owned words' filter."
                    : `No results for "${searchTerm}"`}
                </p>
                {hideExisting && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setHideExisting(false)}
                    className="mt-2"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            ) : (
              sortedDateKeys.map((dateKey) => {
                const groupWords = groupedItems[dateKey];
                const isGroupSelected =
                  groupWords.length > 0 &&
                  groupWords.every((w) => selectedIds.has(w.id));

                return (
                  <div
                    key={dateKey}
                    className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    {/* Date Header */}
                    <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                      <Checkbox
                        checked={isGroupSelected}
                        onCheckedChange={() => handleSelectGroup(dateKey)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                      />
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <CalendarDays size={14} />
                        <span className="text-foreground font-semibold">
                          {formatDateGroup(dateKey)}
                        </span>
                        <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {groupWords.length}
                        </span>
                      </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {groupWords.map((word) => (
                        <SharedItem
                          key={word.id}
                          word={word}
                          isSelected={selectedIds.has(word.id)}
                          isRevealed={revealedIds.has(word.id)}
                          onToggleSelect={handleToggleSelect}
                          onToggleReveal={handleToggleReveal}
                          onImport={(words) => handlePreImport(words)}
                          isWarning={userWordMap.has(word.normalized)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            {/* Load More Trigger */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => loadData(false, searchTerm)}
                  disabled={loading}
                  className="min-w-[150px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <ImportPreviewModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        newItems={importData.newItems}
        conflicts={importData.conflicts}
        onConfirm={handleConfirmImport}
      />
    </div>
  );
};
