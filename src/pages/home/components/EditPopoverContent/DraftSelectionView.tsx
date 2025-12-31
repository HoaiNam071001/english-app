import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { VocabularyItem } from "@/types";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

export const DraftSelectionView = ({
  draft,
  currentForm,
  onApply,
  onCancel,
}: {
  draft: Partial<VocabularyItem>;
  currentForm: Partial<VocabularyItem>;
  onApply: (selected: Partial<VocabularyItem>) => void;
  onCancel: () => void;
}) => {
  // State lưu các field được chọn (Mặc định chọn hết các field có data từ API)
  const [selection, setSelection] = useState<Record<string, boolean>>({
    partOfSpeech: true,
    phonetics: true,
    meaning: !!draft.meaning, // Chỉ auto-check nếu có data
    example: !!draft.example && !currentForm.example,
  });

  const toggleSelect = (key: string) => {
    setSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApply = () => {
    const finalData: Partial<VocabularyItem> = {};
    if (selection.partOfSpeech && draft.partOfSpeech?.length)
      finalData.partOfSpeech = draft.partOfSpeech;
    if (selection.phonetics && draft.phonetics?.length)
      finalData.phonetics = draft.phonetics;
    if (selection.meaning && draft.meaning) finalData.meaning = draft.meaning;
    if (selection.example && draft.example) finalData.example = draft.example;

    onApply(finalData);
  };

  return (
    <div className="w-[350px] min-h-[400px] max-h-[400px] overflow-auto flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
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

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        <p className="text-[10px] text-muted-foreground mb-2">
          Check the fields you want to override from Search Result.
        </p>

        {/* --- Field Items --- */}

        {/* Part Of Speech */}
        {!!draft.partOfSpeech?.length && (
          <SelectionItem
            label="Part of Speech"
            checked={selection.partOfSpeech}
            onToggle={() => toggleSelect("partOfSpeech")}
            content={
              <div className="text-xs">
                {draft.partOfSpeech?.join(", ") || "None"}
              </div>
            }
          />
        )}

        {/* Phonetics */}
        {!!draft.phonetics?.length && (
          <SelectionItem
            label="Phonetics"
            checked={selection.phonetics}
            onToggle={() => toggleSelect("phonetics")}
            content={
              <div className="flex flex-col gap-1">
                {draft.phonetics?.map((p, i) => (
                  <div key={i} className="text-xs font-mono">
                    <span className="text-muted-foreground text-[10px] mr-1 uppercase">
                      {p.accent}
                    </span>
                    /{p.text}/
                  </div>
                )) || <span className="italic">None</span>}
              </div>
            }
          />
        )}

        {/* Meaning */}
        {draft.meaning && (
          <SelectionItem
            label="Meaning (API)"
            checked={selection.meaning}
            onToggle={() => toggleSelect("meaning")}
            content={
              <div className="text-xs line-clamp-2">{draft.meaning}</div>
            }
          />
        )}

        {/* Example */}
        {draft.example && (
          <SelectionItem
            label="Example"
            checked={selection.example}
            onToggle={() => toggleSelect("example")}
            content={
              <div className="text-xs italic line-clamp-3">
                "{draft.example}"
              </div>
            }
          />
        )}
      </div>

      <div className="pt-2 border-t mt-2 flex justify-end gap-2">
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

const SelectionItem = ({ label, checked, onToggle, content }) => (
  <div
    className={`flex items-start gap-3 p-2 rounded-md border cursor-pointer transition-colors ${
      checked ? "bg-background" : "hover:bg-accent"
    }`}
    onClick={onToggle}
  >
    <Checkbox checked={checked} className="mt-1" />
    <div className="flex-1 space-y-1">
      <span className="text-xs font-semibold block">{label}</span>
      <div className="text-muted-foreground">{content}</div>
    </div>
  </div>
);
