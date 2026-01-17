/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { CommonModal } from "@/components/CommonModal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VocabularyItem } from "@/types";
import {
  ArrowRight,
  CheckSquare,
  RefreshCw,
  SquareDashedBottom,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { SharedItem } from "./SharedItem";

export interface ConflictItem {
  existing: VocabularyItem;
  incoming: VocabularyItem;
}

export enum ResolutionType {
  KEEP = "KEEP",
  OVERWRITE = "OVERWRITE",
}

interface ImportPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newItems: VocabularyItem[];
  conflicts: ConflictItem[];
  onConfirm: (
    itemsToAdd: VocabularyItem[],
    itemsToUpdate: { id: string; updates: Partial<VocabularyItem> }[],
  ) => void;
}

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  open,
  onOpenChange,
  newItems,
  conflicts,
  onConfirm,
}) => {
  // State resolve conflict
  const [resolutions, setResolutions] = useState<
    Record<string, ResolutionType>
  >({});

  // [NEW] State chọn items mới (Mặc định chọn hết)
  const [selectedNewIds, setSelectedNewIds] = useState<Set<string>>(
    () => new Set(newItems.map((i) => i.id)),
  );

  // Reset state khi danh sách newItems thay đổi
  useEffect(() => {
    setSelectedNewIds(new Set(newItems.map((i) => i.id)));
  }, [newItems]);

  // --- LOGIC RESOLVE CONFLICT ---
  const handleResolutionChange = (
    normalized: string,
    value: ResolutionType,
  ) => {
    setResolutions((prev) => ({ ...prev, [normalized]: value }));
  };

  const setAllResolutions = (value: ResolutionType) => {
    const newRes: Record<string, ResolutionType> = {};
    conflicts.forEach((c) => {
      newRes[c.existing.normalized] = value;
    });
    setResolutions(newRes);
  };

  // --- LOGIC SELECT NEW ITEMS ---
  const handleToggleNewItem = (id: string) => {
    const next = new Set(selectedNewIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedNewIds(next);
  };

  const handleToggleAllNew = () => {
    if (selectedNewIds.size === newItems.length) {
      setSelectedNewIds(new Set()); // Bỏ chọn hết
    } else {
      setSelectedNewIds(new Set(newItems.map((i) => i.id))); // Chọn hết
    }
  };

  // --- CONFIRM ---
  const handleConfirm = () => {
    // 1. Chỉ lấy những item mới ĐƯỢC CHỌN
    const itemsToAdd = newItems.filter((i) => selectedNewIds.has(i.id));

    // 2. Xử lý conflict
    const itemsToUpdate: { id: string; updates: Partial<VocabularyItem> }[] =
      [];

    conflicts.forEach((c) => {
      const decision =
        resolutions[c.existing.normalized] || ResolutionType.KEEP;
      if (decision === ResolutionType.OVERWRITE) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {
          id,
          userId,
          createdAt,
          updatedAt,
          isShared,
          topicId,
          ...updates
        } = c.incoming;
        itemsToUpdate.push({
          id: c.existing.id,
          updates: updates,
        });
      }
    });

    onConfirm(itemsToAdd, itemsToUpdate);
    onOpenChange(false);
  };

  // Tính toán số lượng import dự kiến để hiển thị ở nút Confirm
  const totalImportCount =
    selectedNewIds.size +
    Object.values(resolutions).filter((r) => r === ResolutionType.OVERWRITE)
      .length;

  return (
    <CommonModal
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center gap-2 text-foreground">
          <RefreshCw size={20} className="text-blue-500" />
          <span>Import Preview</span>
        </div>
      }
      footer={
        <div className="flex justify-end gap-4 w-full pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Confirm Import ({totalImportCount})
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-2 h-[70vh] overflow-y-auto px-1 pb-4 md:w-[1000px] mt-2">
        {/* SUMMARY HEADER */}
        <div className="bg-muted/40 p-3 rounded-lg border text-sm flex gap-6 items-center sticky top-0 z-20 backdrop-blur-md bg-background/80">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>
              <strong className="text-green-600 dark:text-green-400">
                {selectedNewIds.size} / {newItems.length}
              </strong>{" "}
              New selected
            </span>
          </div>
          <div className="h-4 w-[1px] bg-border"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span>
              <strong className="text-orange-600 dark:text-orange-400">
                {conflicts.length}
              </strong>{" "}
              Conflicts
            </span>
          </div>
        </div>

        {/* CONFLICTS SECTION */}
        {conflicts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2 uppercase tracking-wider">
                Resolve Conflicts
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setAllResolutions(ResolutionType.KEEP)}
                >
                  Keep All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setAllResolutions(ResolutionType.OVERWRITE)}
                >
                  Overwrite All
                </Button>
              </div>
            </div>

            <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {conflicts.map((item) => {
                const key = item.existing.normalized;
                const decision = resolutions[key] || ResolutionType.KEEP;

                return (
                  <div key={key} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-muted px-2 py-1 rounded text-muted-foreground uppercase">
                        Conflict:
                      </span>
                      <span className="text-sm font-bold text-foreground capitalize">
                        {item.existing.text}
                      </span>
                    </div>

                    <div className="flex items-stretch gap-1">
                      {/* LEFT: EXISTING */}
                      <div className="flex-1">
                        <SharedItem
                          word={item.existing}
                          isSelected={decision === ResolutionType.KEEP}
                          isRevealed={true}
                          hideImportAction={true}
                          onToggleSelect={() =>
                            handleResolutionChange(key, ResolutionType.KEEP)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-center text-muted-foreground">
                        <ArrowRight size={16} />
                      </div>

                      {/* RIGHT: INCOMING */}
                      <div className="flex-1">
                        <SharedItem
                          word={item.incoming}
                          isSelected={decision === ResolutionType.OVERWRITE}
                          isRevealed={true}
                          hideImportAction={true}
                          onToggleSelect={() =>
                            handleResolutionChange(
                              key,
                              ResolutionType.OVERWRITE,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {conflicts.length > 0 && newItems.length > 0 && <Separator />}

        {/* NEW ITEMS SECTION */}
        {newItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                New Items ({newItems.length})
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleAllNew}
                  className="h-7 text-xs gap-2"
                >
                  {selectedNewIds.size === newItems.length ? (
                    <>
                      <CheckSquare size={14} /> Deselect All
                    </>
                  ) : (
                    <>
                      <SquareDashedBottom size={14} /> Select All
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {newItems.map((item) => {
                const isSelected = selectedNewIds.has(item.id);
                return (
                  <div key={item.id} className="h-full">
                    <SharedItem
                      word={item}
                      isSelected={isSelected}
                      isRevealed={true}
                      hideImportAction={true}
                      onToggleSelect={() => handleToggleNewItem(item.id)} // [NEW] Toggle từng item
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </CommonModal>
  );
};
