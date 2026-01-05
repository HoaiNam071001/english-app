import moment from "moment";
import "moment/locale/vi";
import React, { useEffect, useMemo, useState } from "react";

import {
  BookOpen,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  ChevronsRight,
  Eye,
  EyeOff,
  FolderInput,
  Globe,
  GlobeLock,
  MoreHorizontal,
  Pin,
  RotateCcw,
  Search,
  Share2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { SimpleGroupedList } from "@/components/SimpleGroupedList";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useConfirm } from "@/hooks/useConfirm";
import { BatchUpdateVocabularyItem, VocabularyItem } from "@/types";
import { BulkLookupModal } from "../Lookup/BulkLookupModal";
import MoveTopicModal from "../common/MoveTopicModal";
import { VocabularyItemRow } from "./VocabularyItemRow";

moment.locale("vi");

interface VocabularySidebarProps {
  allWords: VocabularyItem[];
  activeWordIds: Set<string>;
  onAddToPractice: (word: VocabularyItem) => void;
  onDelete: (id: string) => void;
  onBulkAddToPractice?: (words: VocabularyItem[]) => void;
  onRemoveFromPractice?: (word: VocabularyItem) => void;
  onBulkDelete?: (ids: string[]) => void;
  onUpdateWord?: (id: string, updates: Partial<VocabularyItem>) => void;
  onToggleLearned: (id: string, currentStatus: boolean) => void;
  onBulkMarkLearned?: (ids: string[], status: boolean) => void;
  onBulkUpdate?: (ids: string[], updates: Partial<VocabularyItem>) => void;
  batchUpdateWords?: (updates: BatchUpdateVocabularyItem[]) => void;
}

const formatDateGroup = (dateString: string) => {
  const date = moment(dateString);
  if (!date.isValid()) return "Date unknown";
  const now = moment();
  if (date.isSame(now, "day")) return "Today";
  if (date.isSame(now.clone().subtract(1, "days"), "day")) return "Yesterday";
  const formatted = date.format("dddd, DD/MM/YYYY");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

interface DateGroupHeaderProps {
  dateKey: string;
  count: number;
  allSelected: boolean;
  isCollapsed: boolean;
  onSelect: () => void;
  onToggle: () => void;
  customTitle?: string;
  isPinnedGroup?: boolean;
}

const DateGroupHeader = React.memo<DateGroupHeaderProps>(
  ({
    dateKey,
    count,
    allSelected,
    onSelect,
    isCollapsed,
    onToggle,
    customTitle,
    isPinnedGroup,
  }) => {
    return (
      <div
        onClick={onSelect}
        title="Click to select all items in this group"
        className={`
        sticky top-0 z-20 px-2 py-2 mb-2
        text-xs font-bold uppercase tracking-wider border-b border-border
        flex items-center justify-between cursor-pointer transition-colors
        bg-card/95 backdrop-blur-sm shadow-sm select-none
        ${
          allSelected
            ? "text-blue-700 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/30"
            : "text-blue-600 dark:text-blue-400"
        }
      `}
      >
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            className="h-4 w-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <div className="flex items-center gap-1">
            {isPinnedGroup && <Pin size={12} className="fill-current mr-1" />}
            <span>{customTitle || formatDateGroup(dateKey)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`px-1.5 rounded-full text-[10px] ${
              allSelected
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {count}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="py-0.5 px-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-sm transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
        </div>
      </div>
    );
  }
);

DateGroupHeader.displayName = "DateGroupHeader";

const VocabularySidebar: React.FC<VocabularySidebarProps> = ({
  allWords,
  activeWordIds,
  onAddToPractice,
  onDelete,
  onBulkAddToPractice,
  onBulkDelete,
  onUpdateWord,
  onToggleLearned,
  onRemoveFromPractice,
  onBulkMarkLearned,
  onBulkUpdate,
  batchUpdateWords,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [isBulkLookupOpen, setIsBulkLookupOpen] = useState(false);
  const [isMoveTopicModalOpen, setIsMoveTopicModalOpen] = useState(false);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  const { confirm } = useConfirm();
  const { userProfile } = useAuth();

  const HEIGHT_ITEM = 65;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 1. Chỉ lọc theo Search Term
  const searchedWords = useMemo(() => {
    if (!debouncedTerm.trim()) return allWords;
    const lowerTerm = debouncedTerm.toLowerCase();
    return allWords.filter((word) => {
      return (
        word.text.toLowerCase().includes(lowerTerm) ||
        word.meaning.toLowerCase().includes(lowerTerm)
      );
    });
  }, [allWords, debouncedTerm]);

  // 2. Phân loại Group: Pinned tách riêng, Date tách riêng (không trùng nhau)
  const displayGroups = useMemo(() => {
    const dateGroups: Record<string, VocabularyItem[]> = {};
    const pinnedItems: VocabularyItem[] = [];

    searchedWords.forEach((word) => {
      // LOGIC MỚI: Nếu bật mode Pin và từ được Pin -> Vào nhóm Pinned
      if (showPinnedOnly && word.isPinned) {
        pinnedItems.push(word);
      }
      // Ngược lại -> Vào nhóm Date
      else {
        const dateKey = moment(word.createdAt).format("YYYY-MM-DD");
        if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
        dateGroups[dateKey].push(word);
      }
    });

    const sortedDateKeys = Object.keys(dateGroups).sort((a, b) =>
      b.localeCompare(a)
    );

    const groups = [];

    if (showPinnedOnly && pinnedItems.length > 0) {
      groups.push({
        key: "pinned-group-header",
        title: "Pinned Items",
        items: pinnedItems,
        isPinnedGroup: true,
      });
    }

    sortedDateKeys.forEach((key) => {
      groups.push({
        key: key,
        title: formatDateGroup(key),
        items: dateGroups[key],
        isPinnedGroup: false,
      });
    });

    return groups;
  }, [searchedWords, showPinnedOnly]);

  // 3. Tự động collapse khi bật Pin
  useEffect(() => {
    if (showPinnedOnly) {
      const dateGroupKeys = displayGroups
        .filter((g) => !g.isPinnedGroup)
        .map((g) => g.key);
      setCollapsedGroups(new Set(dateGroupKeys));
    } else {
      setCollapsedGroups(new Set());
    }
  }, [showPinnedOnly]);

  // 4. Tính counts
  const groupCounts = useMemo(() => {
    return displayGroups.map((group) => {
      if (collapsedGroups.has(group.key)) return 0;
      return group.items.length;
    });
  }, [displayGroups, collapsedGroups]);

  const isAllCollapsed =
    displayGroups.length > 0 &&
    displayGroups.every((g) => collapsedGroups.has(g.key));

  const toggleCollapseAll = () => {
    if (isAllCollapsed) {
      setCollapsedGroups(new Set());
    } else {
      setCollapsedGroups(new Set(displayGroups.map((g) => g.key)));
    }
  };

  const toggleGroupCollapse = (groupKey: string) => {
    const newSet = new Set(collapsedGroups);
    if (newSet.has(groupKey)) {
      newSet.delete(groupKey);
    } else {
      newSet.add(groupKey);
    }
    setCollapsedGroups(newSet);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(searchedWords.map((w) => w.id)));
    } else {
      setSelectedIds(new Set());
    }
    setLastSelectedId(null);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  };

  const toggleSelection = (id: string, event?: React.MouseEvent) => {
    const newSet = new Set(selectedIds);
    if (event?.shiftKey && lastSelectedId) {
      const visibleIds = searchedWords.map((w) => w.id);
      const lastIndex = visibleIds.indexOf(lastSelectedId);
      const currentIndex = visibleIds.indexOf(id);
      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeIds = visibleIds.slice(start, end + 1);
        rangeIds.forEach((rid) => newSet.add(rid));
      }
    } else {
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setLastSelectedId(id);
    }
    setSelectedIds(newSet);
  };

  const handleSelectGroup = (groupIndex: number) => {
    const group = displayGroups[groupIndex];
    const idsInGroup = group.items.map((w) => w.id);
    const isAllSelected = idsInGroup.every((id) => selectedIds.has(id));
    const newSet = new Set(selectedIds);
    if (isAllSelected) {
      idsInGroup.forEach((id) => newSet.delete(id));
    } else {
      idsInGroup.forEach((id) => newSet.add(id));
    }
    setSelectedIds(newSet);
    setLastSelectedId(null);
  };

  // --- Bulk Actions ---
  const selectedWords = useMemo(() => {
    return allWords.filter((w) => selectedIds.has(w.id));
  }, [allWords, selectedIds]);

  const isAllSelectedLearned = useMemo(() => {
    return selectedWords.length > 0 && selectedWords.every((w) => w.isLearned);
  }, [selectedWords]);

  const handleBulkMark = () => {
    if (onBulkMarkLearned) {
      const targetStatus = !isAllSelectedLearned;
      onBulkMarkLearned(Array.from(selectedIds), targetStatus);
      setSelectedIds(new Set());
      setLastSelectedId(null);
    }
  };

  const handleBulkAdd = () => {
    if (!onBulkAddToPractice) return;
    const words = allWords.filter((w) => selectedIds.has(w.id));
    onBulkAddToPractice(words);
    setSelectedIds(new Set());
    setLastSelectedId(null);
  };

  const confirmBulkMove = (topicId: string | undefined) => {
    if (!onBulkUpdate) return;
    onBulkUpdate(Array.from(selectedIds), { topicId: topicId });
    setSelectedIds(new Set());
    setLastSelectedId(null);
  };

  const handleBulkShare = (isShared: boolean) => {
    if (onBulkUpdate) {
      onBulkUpdate(Array.from(selectedIds), { isShared });
      setSelectedIds(new Set());
      setLastSelectedId(null);
    }
  };

  const handleBulkDeleteWithConfirm = async () => {
    if (!onBulkDelete) return;
    const isConfirmed = await confirm({
      title: `Delete ${selectedIds.size} Vocabulary Items?`,
      message:
        "Are you sure you want to delete these items? This action cannot be undone.",
      confirmText: "Delete Now",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (isConfirmed) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setLastSelectedId(null);
    }
  };

  const isAllRevealed =
    searchedWords.length > 0 && revealedIds.size === searchedWords.length;
  const toggleRevealAll = () => {
    if (isAllRevealed) setRevealedIds(new Set());
    else setRevealedIds(new Set(searchedWords.map((w) => w.id)));
  };
  const toggleRevealItem = (id: string) => {
    const newSet = new Set(revealedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setRevealedIds(newSet);
  };

  return (
    <div className="flex flex-col bg-card border-r pr-2 h-full overflow-hidden">
      <MoveTopicModal
        open={isMoveTopicModalOpen}
        onOpenChange={setIsMoveTopicModalOpen}
        selectedCount={selectedIds.size}
        onConfirm={confirmBulkMove}
      />

      <BulkLookupModal
        open={isBulkLookupOpen}
        onOpenChange={setIsBulkLookupOpen}
        selectedWords={selectedWords}
        onApplyUpdates={batchUpdateWords}
      />

      {/* SEARCH BAR */}
      <div className="p-3 pb-0 z-20">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 bg-muted/50 border-border focus:bg-background transition-all h-9 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* HEADER TOOLBAR */}
      <div className="px-3 py-1 border-b flex items-center justify-between bg-card z-10">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={
              searchedWords.length > 0 &&
              selectedIds.size === searchedWords.length
            }
            onCheckedChange={(c) => handleSelectAll(c as boolean)}
          />
          <span className="text-sm font-semibold text-card-foreground">
            {selectedIds.size > 0
              ? `(${selectedIds.size})`
              : `List (${searchedWords.length})`}
          </span>
        </div>

        <div className="flex gap-1 items-center">
          {selectedIds.size > 0 ? (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDeselectAll}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <X size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Deselect all</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsBulkLookupOpen(true)}
                      className="h-8 w-8 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950"
                    >
                      <Sparkles size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Enrich Vocabulary</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBulkAdd}
                      className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                    >
                      <BookOpen size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add to lesson</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground hover:bg-accent"
                  >
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    Actions ({selectedIds.size})
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleBulkMark}>
                    {isAllSelectedLearned ? (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" /> Mark as Unlearned
                      </>
                    ) : (
                      <>
                        <CheckSquare className="mr-2 h-4 w-4" /> Mark as Learned
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsMoveTopicModalOpen(true)}
                  >
                    <FolderInput className="mr-2 h-4 w-4" /> Assign Topic
                  </DropdownMenuItem>
                  {!!userProfile && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Community Sharing</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-48">
                        <DropdownMenuItem onClick={() => handleBulkShare(true)}>
                          <Globe className="mr-2 h-4 w-4 text-emerald-600" />
                          <span>Share Publicly</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBulkShare(false)}
                        >
                          <GlobeLock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Make Private</span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleBulkDeleteWithConfirm}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showPinnedOnly ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                      className={`h-8 w-8 transition-colors ${
                        showPinnedOnly
                          ? "text-orange-600 bg-orange-100 dark:bg-orange-950/50 dark:text-orange-400"
                          : "text-muted-foreground hover:text-orange-600 hover:bg-orange-50"
                      }`}
                    >
                      <Pin
                        size={16}
                        className={showPinnedOnly ? "fill-current" : ""}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {showPinnedOnly
                      ? "Show Normal View"
                      : "Group Pinned & Collapse Others"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleRevealAll}
                      className="h-8 w-8 text-muted-foreground"
                    >
                      {isAllRevealed ? <Eye size={18} /> : <EyeOff size={18} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isAllRevealed ? "Hide all meanings" : "Show all meanings"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapseAll}
                  disabled={displayGroups.length === 0}
                  className="h-8 w-8 text-muted-foreground hover:bg-accent"
                >
                  {isAllCollapsed ? (
                    <ChevronsDown size={16} />
                  ) : (
                    <ChevronsRight size={16} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isAllCollapsed ? "Expand all groups" : "Collapse all groups"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* --- LIST CONTENT VIRTUALIZED --- */}
      <div className="flex-1 mt-0 w-full overflow-hidden pl-1">
        {displayGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10 text-muted-foreground gap-2">
            <Search size={32} className="opacity-20" />
            <span className="text-sm">No results found.</span>
          </div>
        ) : (
          <SimpleGroupedList
            groupCounts={groupCounts}
            estimateRowHeight={HEIGHT_ITEM}
            groupContent={(index) => {
              const group = displayGroups[index];
              const realCount = group.items.length;
              const allSelected = group.items.every((w) =>
                selectedIds.has(w.id)
              );

              return (
                <DateGroupHeader
                  key={group.key}
                  dateKey={group.key}
                  count={realCount}
                  allSelected={allSelected}
                  onSelect={() => handleSelectGroup(index)}
                  isCollapsed={collapsedGroups.has(group.key)}
                  onToggle={() => toggleGroupCollapse(group.key)}
                  customTitle={group.title}
                  isPinnedGroup={group.isPinnedGroup}
                />
              );
            }}
            itemContent={(index, groupIndex, itemIndex) => {
              const group = displayGroups[groupIndex];
              const word = group.items[itemIndex];

              // Vì item chỉ xuất hiện 1 lần duy nhất trong toàn bộ list (do logic if/else)
              // nên dùng word.id làm key là đủ và an toàn nhất
              return (
                <div
                  className="pb-1 pr-1"
                  style={{ height: HEIGHT_ITEM }}
                  key={word.id}
                >
                  <VocabularyItemRow
                    word={word}
                    isActive={activeWordIds.has(word.id)}
                    isSelected={selectedIds.has(word.id)}
                    isMeaningRevealed={revealedIds.has(word.id)}
                    onToggleSelection={toggleSelection}
                    onToggleReveal={toggleRevealItem}
                    onAddToPractice={onAddToPractice}
                    onUpdate={onUpdateWord || (() => {})}
                    onDelete={onDelete}
                    onToggleLearned={onToggleLearned}
                    onRemoveFromPractice={onRemoveFromPractice}
                  />
                </div>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default VocabularySidebar;
