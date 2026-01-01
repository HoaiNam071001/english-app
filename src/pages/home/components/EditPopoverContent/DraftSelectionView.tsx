import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PartOfSpeech, VocabularyItem, WordData } from "@/types";
import { formatNoteForSave, transformApiData } from "@/utils/vocabularyUtils";
import { ArrowLeft, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { EnMeaningSelector } from "../Lookup/EnMeaningSelector";

interface DraftSelectionViewProps {
  // Nhận vào Raw Data từ API
  data: WordData;
  origin: Partial<VocabularyItem>;
  onApply: (selected: Partial<VocabularyItem>) => void;
  onCancel: () => void;
}

export const DraftSelectionView = ({
  data,
  origin,
  onApply,
  onCancel,
}: DraftSelectionViewProps) => {
  // 1. Transform raw data thành cấu trúc để hiển thị
  const draft = useMemo(() => transformApiData(data), [data]);

  // --- STATE ---
  const [selPhonetics, setSelPhonetics] = useState<boolean>(!origin.phonetics);
  const [selPos, setSelPos] = useState<PartOfSpeech[]>(
    origin.partOfSpeech ? [] : draft.partOfSpeech || []
  );
  const [selNoteIndices, setSelNoteIndices] = useState<number[]>([]);

  // --- HANDLERS ---
  const togglePos = (pos: PartOfSpeech) => {
    setSelPos((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  const handleApply = () => {
    const finalData: Partial<VocabularyItem> = {};

    // Apply Phonetics
    if (selPhonetics && draft.phonetics?.length) {
      finalData.phonetics = draft.phonetics;
    }

    // Apply POS
    if (selPos.length > 0) {
      finalData.partOfSpeech = selPos;
    }

    // Logic Note
    if (draft.enMeanings && selNoteIndices.length > 0) {
      const selectedMeanings = draft.enMeanings.filter((_, i) =>
        selNoteIndices.includes(i)
      );
      finalData.example = formatNoteForSave(selectedMeanings);
    }

    onApply(finalData);
  };

  return (
    <div className="w-[500px] min-h-[500px] max-h-[600px] flex flex-col h-full animate-in slide-in-from-right-4 duration-200 bg-background">
      {/* HEADER */}
      <div className="flex items-center gap-2 pb-2 border-b mb-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onCancel}
        >
          <ArrowLeft size={14} />
        </Button>
        <h4 className="font-semibold text-sm">Select Data to Apply</h4>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <p className="text-[10px] text-muted-foreground">
          Select individual fields to override your current data.
        </p>

        {/* 1. PHONETICS */}
        {draft.phonetics.length > 0 && (
          <div
            className={`flex items-start gap-3 p-2 rounded-md border cursor-pointer transition-colors ${
              selPhonetics
                ? "bg-background border-primary/30"
                : "hover:bg-accent border-transparent"
            }`}
            onClick={() => setSelPhonetics(!selPhonetics)}
          >
            <Checkbox checked={selPhonetics} className="mt-1" />
            <div className="flex-1 space-y-1">
              <span className="text-xs font-semibold block">Phonetics</span>
              <div className="flex flex-col gap-1">
                {draft.phonetics.map((p, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono text-muted-foreground"
                  >
                    <span className="text-[10px] mr-1 uppercase bg-muted px-1 rounded">
                      {p.accent || "-"}
                    </span>
                    /{p.text}/
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. PART OF SPEECH */}
        {draft.partOfSpeech.length > 0 && (
          <div className="p-2 rounded-md border border-muted bg-muted/10">
            <span className="text-xs font-semibold block mb-2">
              Part of Speech
            </span>
            <div className="flex flex-col gap-2">
              {draft.partOfSpeech.map((pos) => {
                const isSelected = selPos.includes(pos);
                return (
                  <div
                    key={pos}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => togglePos(pos)}
                  >
                    <Checkbox checked={isSelected} className="w-4 h-4" />
                    <span
                      className={`text-xs ${
                        isSelected
                          ? "text-blue-700 font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {pos}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. NOTE / EXAMPLE */}
        {draft.enMeanings && draft.enMeanings.length > 0 && (
          <div className="p-2 rounded-md border border-muted bg-muted/10">
            <div className="mb-2">
              <span className="text-xs font-semibold">
                Note (English Details)
              </span>
            </div>
            <EnMeaningSelector
              meanings={draft.enMeanings}
              selectedIndices={selNoteIndices}
              onSelectionChange={setSelNoteIndices}
              idPrefix="draft-view"
            />
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="pt-4 border-t mt-2 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button size="sm" className="h-7 text-xs" onClick={handleApply}>
          <Check size={14} className="mr-1" /> Apply Selected
        </Button>
      </div>
    </div>
  );
};
