import { CommonModal } from "@/components/CommonModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDictionary } from "@/hooks/useDictionary";
import {
  BatchUpdateVocabularyItem,
  PartOfSpeech,
  VocabularyItem,
} from "@/types";
import {
  formatNoteForSave,
  ProcessedDraft,
  transformApiData,
} from "@/utils/vocabularyUtils";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Check, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { LookupRow } from "./LookupRow";

// --- TYPES ---

type RowStatus = "idle" | "loading" | "found" | "not-found";

export interface VolLookupResult {
  original: VocabularyItem;
  draft: ProcessedDraft | null;
  status: RowStatus;
}

export interface ItemSelection {
  rowSelected: boolean;
  phonetics: boolean;
  selectedPos: PartOfSpeech[];
  selectedEnMeaningIndices: number[];
}

type SelectionState = Record<string, ItemSelection>;

interface BulkLookupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedWords: VocabularyItem[];
  onApplyUpdates: (updates: BatchUpdateVocabularyItem[]) => void;
}

// --- MAIN COMPONENT ---
export const BulkLookupModal: React.FC<BulkLookupModalProps> = ({
  open,
  onOpenChange,
  selectedWords,
  onApplyUpdates,
}) => {
  const { lookupWords } = useDictionary();
  const [results, setResults] = useState<VolLookupResult[]>([]);
  const [selections, setSelections] = useState<SelectionState>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Initial Lookup
  useEffect(() => {
    if (open && selectedWords.length > 0) {
      void handleLookup();
    } else {
      setResults([]);
      setSelections({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedWords]);

  const handleLookup = async () => {
    setIsProcessing(true);
    setResults(
      selectedWords.map((w) => ({
        original: w,
        draft: null,
        status: "loading",
      }))
    );

    try {
      const texts = selectedWords.map((w) => w.text);
      const rawData = await lookupWords(texts);

      const newResults: VolLookupResult[] = selectedWords.map((original) => {
        const apiData = rawData.find(
          (d) => d.word.toLowerCase() === original.text.toLowerCase()
        );

        if (!apiData) return { original, draft: null, status: "not-found" };

        const draft = transformApiData(apiData);
        return { original, draft, status: "found" };
      });

      setResults(newResults);

      // --- SET DEFAULT SELECTION ---
      const initialSelections: SelectionState = {};
      newResults.forEach((r) => {
        if (r.status === "found" && r.draft) {
          initialSelections[r.original.id] = {
            rowSelected: true,
            phonetics: true,
            selectedPos: r.draft.partOfSpeech, // Default: Select ALL available POS
            selectedEnMeaningIndices: [], // Default: Uncheck Note
          };
        }
      });
      setSelections(initialSelections);
    } catch (error) {
      console.error("Bulk lookup failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- ACTIONS ---

  const getUpdates = (id: string) => {
    const res = results.find((r) => r.original.id === id);
    const sel = selections[id];
    if (!res || !res.draft || !sel) return;

    const updates: Partial<VocabularyItem> = {};

    if (sel.phonetics) {
      updates.phonetics = res.draft.phonetics;
    }

    // CHANGE: Chỉ lưu những POS nào được chọn trong mảng selectedPos
    if (sel.selectedPos.length > 0) {
      updates.partOfSpeech = sel.selectedPos;
    }

    if (sel.selectedEnMeaningIndices.length > 0) {
      const selectedMeanings = res.draft.enMeanings.filter((_, i) =>
        sel.selectedEnMeaningIndices.includes(i)
      );
      updates.example = formatNoteForSave(selectedMeanings);
    }
    return updates;
  };

  const handleIgnoreRow = (id: string) => {
    setResults((prev) => prev.filter((r) => r.original.id !== id));
    setSelections((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleApplySelectedAll = () => {
    const updates = results
      .filter(
        (r) => r.status === "found" && selections[r.original.id]?.rowSelected
      )
      .map((r) => ({
        id: r.original.id,
        updates: getUpdates(r.original.id),
      }));
    onApplyUpdates(updates);
    onOpenChange(false);
  };
  // --- TOGGLE LOGIC ---

  const toggleRow = (id: string, checked: boolean) => {
    const res = results.find((r) => r.original.id === id);
    if (!res?.draft) return;

    setSelections((prev) => ({
      ...prev,
      [id]: {
        rowSelected: checked,
        phonetics: checked,
        // Toggle Row: Check hết hoặc bỏ hết POS
        selectedPos: checked ? res.draft!.partOfSpeech : [],
        selectedEnMeaningIndices: [],
      },
    }));
  };

  // Toggle Global Column
  const toggleColumnAll = (
    column: "phonetics" | "partOfSpeech" | "enMeanings",
    checked: boolean
  ) => {
    setSelections((prev) => {
      const next = { ...prev };
      results.forEach((r) => {
        if (r.status === "found" && r.draft && next[r.original.id]) {
          const currentSel = next[r.original.id];

          if (column === "enMeanings") {
            next[r.original.id] = {
              ...currentSel,
              selectedEnMeaningIndices: checked
                ? r.draft.enMeanings.map((_, i) => i)
                : [],
            };
          } else if (column === "partOfSpeech") {
            // Toggle Column POS: Select All or None for each row
            next[r.original.id] = {
              ...currentSel,
              selectedPos: checked ? r.draft.partOfSpeech : [],
            };
          } else {
            next[r.original.id] = { ...currentSel, [column]: checked };
          }
        }
      });
      return next;
    });
  };

  const toggleAllGlobal = (checked: boolean) => {
    setSelections((prev) => {
      const next = { ...prev };
      results.forEach((r) => {
        if (r.status === "found" && r.draft) {
          next[r.original.id] = {
            rowSelected: checked,
            phonetics: checked,
            selectedPos: checked ? r.draft.partOfSpeech : [],
            selectedEnMeaningIndices: checked
              ? r.draft.enMeanings.map((_, i) => i)
              : [],
          };
        }
      });
      return next;
    });
  };

  // --- COMPUTED HEADER STATES ---
  const validResults = results.filter((r) => r.status === "found");
  const hasValid = validResults.length > 0;

  const allRowsChecked =
    hasValid &&
    validResults.every((r) => selections[r.original.id]?.rowSelected);
  const allPhoneticsChecked =
    hasValid && validResults.every((r) => selections[r.original.id]?.phonetics);
  const allMeaningsChecked =
    hasValid &&
    validResults.every((r) => {
      const sel = selections[r.original.id];
      const draft = r.draft;
      if (!sel || !draft) return false;
      return sel.selectedEnMeaningIndices.length === draft.enMeanings.length;
    });

  // Check if ALL POS of ALL valid rows are selected
  const allPosChecked =
    hasValid &&
    validResults.every((r) => {
      const sel = selections[r.original.id];
      const draft = r.draft;
      if (!sel || !draft) return false;
      return (
        sel.selectedPos.length === draft.partOfSpeech.length &&
        draft.partOfSpeech.length > 0
      );
    });

  const selectedCount = validResults.filter(
    (r) => selections[r.original.id]?.rowSelected
  ).length;

  return (
    <CommonModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Enrich Vocabulary (${results.length})`}
      icon={<Sparkles size={20} className="text-purple-600" />}
      description="Fetch data to update Phonetics, Type, and Notes."
      footer={
        <div className="flex flex-col sm:flex-row gap-2 justify-end w-full pt-2 border-t mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApplySelectedAll}
            disabled={selectedCount === 0}
          >
            <Check size={16} className="mr-2" />
            Apply Selected ({selectedCount})
          </Button>
        </div>
      }
    >
      <div className="relative border rounded-md overflow-hidden bg-background h-[600px] flex flex-col w-[1000px]">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted sticky top-0 z-20 shadow-sm text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                {/* WORD */}
                <th className="p-3 w-[160px] bg-muted/50 z-20 border-r">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="word-row-all"
                      checked={allRowsChecked}
                      onCheckedChange={(c: CheckedState) =>
                        toggleAllGlobal(c === true)
                      }
                    />
                    <label htmlFor="word-row-all">Word</label>
                  </div>
                </th>

                {/* PHONETICS */}
                <th className="p-3 w-[140px] border-r">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="PHONETICS-row-all"
                      checked={allPhoneticsChecked}
                      onCheckedChange={(c: CheckedState) =>
                        toggleColumnAll("phonetics", c === true)
                      }
                    />
                    <label htmlFor="PHONETICS-row-all">Phonetics</label>
                  </div>
                </th>

                {/* TYPE (POS) */}
                <th className="p-3 w-[120px] border-r">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="TYPE-row-all"
                      checked={allPosChecked}
                      onCheckedChange={(c: CheckedState) =>
                        toggleColumnAll("partOfSpeech", c === true)
                      }
                    />
                    <label htmlFor="TYPE-row-all">Type</label>
                  </div>
                </th>

                {/* NOTE */}
                <th className="p-3 min-w-[350px]">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="NOTE-row-all"
                      checked={allMeaningsChecked}
                      onCheckedChange={(c: CheckedState) =>
                        toggleColumnAll("enMeanings", c === true)
                      }
                    />
                    <label htmlFor="NOTE-row-all">Note</label>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {results.map((item) => (
                <LookupRow
                  key={item.original.id}
                  item={item}
                  selection={selections[item.original.id]}
                  onUpdateSelection={(newSel) =>
                    setSelections((prev) => ({
                      ...prev,
                      [item.original.id]: newSel,
                    }))
                  }
                  onToggleRow={(c) => toggleRow(item.original.id, c)}
                  onIgnore={() => handleIgnoreRow(item.original.id)}
                />
              ))}
              {!isProcessing && results.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-muted-foreground"
                  >
                    All words processed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </CommonModal>
  );
};
