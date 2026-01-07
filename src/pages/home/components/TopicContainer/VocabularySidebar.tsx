/* eslint-disable react-refresh/only-export-components */
import moment from "moment";
import "moment/locale/vi";
import React, { useEffect, useMemo, useState } from "react";

import {
  Ampersand,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  ChevronsDown,
  ChevronsRight,
  Circle,
  Eye,
  EyeOff,
  Filter,
  FolderInput,
  Globe,
  GlobeLock,
  Layers,
  LayoutList,
  ListFilter,
  Lock,
  MoreHorizontal,
  Pin,
  PinOff,
  RotateCcw,
  Search,
  Share2,
  Sparkles,
  Split,
  Tag,
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useConfirm } from "@/hooks/useConfirm";
import { cn } from "@/lib/utils";
import { BatchUpdateVocabularyItem, VocabularyItem } from "@/types";
import { formatDateGroup } from "@/utils";
import { BulkLookupModal } from "../Lookup/BulkLookupModal";
import MoveTopicModal from "../common/MoveTopicModal";
import WordTypeSelector from "../common/WordTypeSelector";
import { BulkAssignTypeModal } from "./BulkAssignTypeModal";
import { DateGroupHeader } from "./DateGroupHeader";
import {
  DEFAULT_FILTER,
  FilterOperator,
  FilterOptionRow,
  FilterState,
  LearningStatus,
  PinStatus,
  SharingStatus,
} from "./FilterOptionRow";
import { VocabularyItemRow } from "./VocabularyItemRow";

moment.locale("vi");

// --- ENUMS & TYPES ---

// 2. Bulk Assign Type Modal

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
  // State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  // Modals
  const [isBulkLookupOpen, setIsBulkLookupOpen] = useState(false);
  const [isMoveTopicModalOpen, setIsMoveTopicModalOpen] = useState(false);
  const [isBulkTypeModalOpen, setIsBulkTypeModalOpen] = useState(false);

  // Filter
  const [activeFilters, setActiveFilters] =
    useState<FilterState>(DEFAULT_FILTER);
  const [tempFilters, setTempFilters] = useState<FilterState>(DEFAULT_FILTER);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  // Grouping
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  const { confirm } = useConfirm();
  const { userProfile } = useAuth();
  const HEIGHT_ITEM = 65;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- FILTER LOGIC ---
  const searchedWords = useMemo(() => {
    let result = allWords;

    // 1. Search Term (Always AND)
    if (debouncedTerm.trim()) {
      const lowerTerm = debouncedTerm.toLowerCase();
      result = result.filter(
        (word) =>
          word.text.toLowerCase().includes(lowerTerm) ||
          word.meaning.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Advanced Filters
    const { typeIds, learningStatus, sharingStatus, pinStatus, operator } =
      activeFilters;

    const hasActiveFilters =
      typeIds.length > 0 ||
      learningStatus !== LearningStatus.All ||
      sharingStatus !== SharingStatus.All ||
      pinStatus !== PinStatus.All;

    if (hasActiveFilters) {
      result = result.filter((word) => {
        const conditions: boolean[] = [];

        // Type
        if (typeIds.length > 0) {
          const hasType =
            word.typeIds && word.typeIds.some((id) => typeIds.includes(id));
          conditions.push(!!hasType);
        }

        // Learned
        if (learningStatus !== LearningStatus.All) {
          conditions.push(
            learningStatus === LearningStatus.Learned
              ? !!word.isLearned
              : !word.isLearned
          );
        }

        // Shared
        if (sharingStatus !== SharingStatus.All) {
          conditions.push(
            sharingStatus === SharingStatus.Shared
              ? !!word.isShared
              : !word.isShared
          );
        }

        // Pinned
        if (pinStatus !== PinStatus.All) {
          conditions.push(
            pinStatus === PinStatus.Pinned ? !!word.isPinned : !word.isPinned
          );
        }

        if (conditions.length === 0) return true;
        return operator === FilterOperator.AND
          ? conditions.every((c) => c)
          : conditions.some((c) => c);
      });
    }

    return result;
  }, [allWords, debouncedTerm, activeFilters]);

  // --- GROUPING LOGIC ---
  const displayGroups = useMemo(() => {
    const dateGroups: Record<string, VocabularyItem[]> = {};
    const pinnedItems: VocabularyItem[] = [];

    searchedWords.forEach((word) => {
      if (showPinnedOnly && word.isPinned) {
        pinnedItems.push(word);
      } else {
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

  // --- EFFECT: SYNC PIN MODE ---
  useEffect(() => {
    if (showPinnedOnly) {
      const dateGroupKeys = displayGroups
        .filter((g) => !g.isPinnedGroup)
        .map((g) => g.key);
      setCollapsedGroups(new Set(dateGroupKeys));
    } else {
      setCollapsedGroups(new Set());
    }
  }, [showPinnedOnly, displayGroups.length]);

  // --- HELPERS ---
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
    setCollapsedGroups(
      isAllCollapsed ? new Set() : new Set(displayGroups.map((g) => g.key))
    );
  };

  const toggleGroupCollapse = (groupKey: string) => {
    const newSet = new Set(collapsedGroups);
    newSet.has(groupKey) ? newSet.delete(groupKey) : newSet.add(groupKey);
    setCollapsedGroups(newSet);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(searchedWords.map((w) => w.id)));
    else setSelectedIds(new Set());
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
      const start = Math.min(
        visibleIds.indexOf(lastSelectedId),
        visibleIds.indexOf(id)
      );
      const end = Math.max(
        visibleIds.indexOf(lastSelectedId),
        visibleIds.indexOf(id)
      );
      if (start !== -1 && end !== -1) {
        visibleIds.slice(start, end + 1).forEach((rid) => newSet.add(rid));
      }
    } else {
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      setLastSelectedId(id);
    }
    setSelectedIds(newSet);
  };

  const handleSelectGroup = (groupIndex: number) => {
    const group = displayGroups[groupIndex];
    const ids = group.items.map((w) => w.id);
    const isAll = ids.every((id) => selectedIds.has(id));
    const newSet = new Set(selectedIds);
    ids.forEach((id) => (isAll ? newSet.delete(id) : newSet.add(id)));
    setSelectedIds(newSet);
    setLastSelectedId(null);
  };

  // Bulk Handlers
  const selectedWords = useMemo(
    () => allWords.filter((w) => selectedIds.has(w.id)),
    [allWords, selectedIds]
  );
  const isAllSelectedLearned = useMemo(
    () => selectedWords.length > 0 && selectedWords.every((w) => w.isLearned),
    [selectedWords]
  );

  const handleBulkMark = () => {
    onBulkMarkLearned?.(Array.from(selectedIds), !isAllSelectedLearned);
    handleDeselectAll();
  };

  const handleBulkAdd = () => {
    onBulkAddToPractice?.(selectedWords);
    handleDeselectAll();
  };

  const confirmBulkMove = (topicId: string | undefined) => {
    onBulkUpdate?.(Array.from(selectedIds), { topicId });
    handleDeselectAll();
  };

  const confirmBulkAssignType = (typeIds: string[]) => {
    onBulkUpdate?.(Array.from(selectedIds), { typeIds });
    handleDeselectAll();
  };

  const handleBulkShare = (isShared: boolean) => {
    onBulkUpdate?.(Array.from(selectedIds), { isShared });
    handleDeselectAll();
  };

  const handleBulkDeleteWithConfirm = async () => {
    if (
      await confirm({
        title: `Delete ${selectedIds.size} items?`,
        message: "Cannot be undone.",
        confirmText: "Delete",
        variant: "destructive",
      })
    ) {
      onBulkDelete?.(Array.from(selectedIds));
      handleDeselectAll();
    }
  };

  // Filter Logic Handlers
  const handleApplyFilter = () => {
    setActiveFilters(tempFilters);
    setIsFilterPopoverOpen(false);
  };

  const handleResetFilter = () => {
    setTempFilters(DEFAULT_FILTER);
    setActiveFilters(DEFAULT_FILTER);
    setIsFilterPopoverOpen(false);
  };

  const isFiltering = useMemo(() => {
    return (
      activeFilters.typeIds.length > 0 ||
      activeFilters.learningStatus !== LearningStatus.All ||
      activeFilters.sharingStatus !== SharingStatus.All ||
      activeFilters.pinStatus !== PinStatus.All
    );
  }, [activeFilters]);

  // View Helpers
  const isAllRevealed =
    searchedWords.length > 0 && revealedIds.size === searchedWords.length;
  const toggleRevealAll = () => {
    setRevealedIds(
      isAllRevealed ? new Set() : new Set(searchedWords.map((w) => w.id))
    );
  };
  const toggleRevealItem = (id: string) => {
    const newSet = new Set(revealedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setRevealedIds(newSet);
  };

  return (
    <div className="flex flex-col bg-card border-r pr-2 h-full overflow-hidden">
      {/* --- MODALS --- */}
      <MoveTopicModal
        open={isMoveTopicModalOpen}
        onOpenChange={setIsMoveTopicModalOpen}
        selectedCount={selectedIds.size}
        onConfirm={confirmBulkMove}
      />
      <BulkAssignTypeModal
        open={isBulkTypeModalOpen}
        onOpenChange={setIsBulkTypeModalOpen}
        selectedCount={selectedIds.size}
        onConfirm={confirmBulkAssignType}
      />
      <BulkLookupModal
        open={isBulkLookupOpen}
        onOpenChange={setIsBulkLookupOpen}
        selectedWords={selectedWords}
        onApplyUpdates={batchUpdateWords}
      />

      {/* --- TOP BAR: SEARCH & FILTER --- */}
      <div className="p-3 pb-0 z-20 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 bg-muted/50 border-border h-9 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <Popover
          open={isFilterPopoverOpen}
          onOpenChange={(open) => {
            setIsFilterPopoverOpen(open);
            if (open) setTempFilters(activeFilters);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant={isFiltering ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-9 w-9 shrink-0 cursor-pointer",
                isFiltering && "bg-primary"
              )}
            >
              <ListFilter size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Filter size={14} /> Filter Options
                </h4>
                {isFiltering && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground"
                    onClick={() => setTempFilters(DEFAULT_FILTER)}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* Word Types */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Word Types
                </Label>
                <WordTypeSelector
                  value={tempFilters.typeIds}
                  onChange={(val) =>
                    setTempFilters((prev) => ({ ...prev, typeIds: val }))
                  }
                  className="w-full"
                />
              </div>

              {/* Status Filters Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Column 1: Learning Status */}
                <FilterOptionRow
                  label="Learning Status"
                  value={tempFilters.learningStatus}
                  onChange={(val) =>
                    setTempFilters((prev) => ({ ...prev, learningStatus: val }))
                  }
                  options={[
                    {
                      value: LearningStatus.All,
                      icon: <LayoutList size={16} />,
                      tooltip: "All items",
                    },
                    {
                      value: LearningStatus.Learned,
                      icon: (
                        <CheckCircle2 size={16} className="text-green-600" />
                      ),
                      tooltip: "Learned",
                    },
                    {
                      value: LearningStatus.NotLearned,
                      icon: (
                        <Circle size={16} className="text-muted-foreground" />
                      ),
                      tooltip: "Learning (Not learned)",
                    },
                  ]}
                />

                {/* Column 2: Visibility */}
                <FilterOptionRow
                  label="Visibility"
                  value={tempFilters.sharingStatus}
                  onChange={(val) =>
                    setTempFilters((prev) => ({ ...prev, sharingStatus: val }))
                  }
                  options={[
                    {
                      value: SharingStatus.All,
                      icon: <Layers size={16} />,
                      tooltip: "All",
                    },
                    {
                      value: SharingStatus.Shared,
                      icon: <Globe size={16} className="text-blue-500" />,
                      tooltip: "Public / Shared",
                    },
                    {
                      value: SharingStatus.Private,
                      icon: <Lock size={16} className="text-amber-500" />,
                      tooltip: "Private",
                    },
                  ]}
                />
              </div>

              {/* Row: Pinned & Logic */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <FilterOptionRow
                  label="Pinned"
                  value={tempFilters.pinStatus}
                  onChange={(val) =>
                    setTempFilters((prev) => ({ ...prev, pinStatus: val }))
                  }
                  options={[
                    {
                      value: PinStatus.All,
                      icon: <LayoutList size={16} />,
                      tooltip: "All",
                    },
                    {
                      value: PinStatus.Pinned,
                      icon: (
                        <Pin
                          size={16}
                          className="text-orange-500 fill-orange-500"
                        />
                      ),
                      tooltip: "Pinned Only",
                    },
                    {
                      value: PinStatus.NotPinned,
                      icon: <PinOff size={16} />,
                      tooltip: "Unpinned Only",
                    },
                  ]}
                />

                <FilterOptionRow
                  label="Match Logic"
                  value={tempFilters.operator}
                  onChange={(val) =>
                    setTempFilters((prev) => ({ ...prev, operator: val }))
                  }
                  options={[
                    {
                      value: FilterOperator.OR,
                      icon: <Split size={16} className="rotate-180" />, // Icon tượng trưng rẽ nhánh (OR)
                      tooltip: "Match ANY condition (OR)",
                    },
                    {
                      value: FilterOperator.AND,
                      icon: <Ampersand size={16} />,
                      tooltip: "Match ALL conditions (AND)",
                    },
                  ]}
                />
              </div>

              <div className="pt-2 flex gap-2 border-t mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={handleResetFilter}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={handleApplyFilter}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* --- SELECTION TOOLBAR --- */}
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
              {/* --- ACTION ICONS (SELECTED) --- */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDeselectAll}
                      className="h-8 w-8"
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
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
                  <DropdownMenuItem
                    onClick={() => setIsBulkTypeModalOpen(true)}
                  >
                    <Tag className="mr-2 h-4 w-4" /> Assign Word Types
                  </DropdownMenuItem>
                  {!!userProfile && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Sharing</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleBulkShare(true)}>
                          <Globe className="mr-2 h-4 w-4 text-emerald-600" />
                          Public
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBulkShare(false)}
                        >
                          <GlobeLock className="mr-2 h-4 w-4" /> Private
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
              {/* --- VIEW ICONS (NO SELECTION) --- */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showPinnedOnly ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                      className={cn(
                        "h-8 w-8 transition-colors",
                        showPinnedOnly &&
                          "text-orange-600 bg-orange-100 dark:bg-orange-950/50"
                      )}
                    >
                      <Pin
                        size={16}
                        className={showPinnedOnly ? "fill-current" : ""}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Group Pinned items</TooltipContent>
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
                    {isAllRevealed ? "Hide Meanings" : "Show Meanings"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleCollapseAll}
                      disabled={displayGroups.length === 0}
                      className="h-8 w-8 text-muted-foreground"
                    >
                      {isAllCollapsed ? (
                        <ChevronsDown size={16} />
                      ) : (
                        <ChevronsRight size={16} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isAllCollapsed ? "Expand All" : "Collapse All"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      {/* --- LIST --- */}
      <div className="flex-1 mt-0 w-full overflow-hidden pl-1">
        {displayGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10 text-muted-foreground gap-2">
            {isFiltering ? (
              <Filter size={32} className="opacity-20" />
            ) : (
              <Search size={32} className="opacity-20" />
            )}
            <span className="text-sm">
              {isFiltering ? "No matches found." : "No results."}
            </span>
            {isFiltering && (
              <Button
                variant="link"
                size="sm"
                onClick={handleResetFilter}
                className="h-auto p-0 text-primary"
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <SimpleGroupedList
            groupCounts={groupCounts}
            estimateRowHeight={HEIGHT_ITEM}
            groupContent={(index) => {
              const group = displayGroups[index];
              return (
                <DateGroupHeader
                  key={group.key}
                  dateKey={group.key}
                  count={group.items.length}
                  allSelected={group.items.every((w) => selectedIds.has(w.id))}
                  onSelect={() => handleSelectGroup(index)}
                  isCollapsed={collapsedGroups.has(group.key)}
                  onToggle={() => toggleGroupCollapse(group.key)}
                  customTitle={group.title}
                  isPinnedGroup={group.isPinnedGroup}
                />
              );
            }}
            itemContent={(index, groupIndex, itemIndex) => {
              const word = displayGroups[groupIndex].items[itemIndex];
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
