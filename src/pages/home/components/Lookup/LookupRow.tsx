import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PartOfSpeech } from "@/types";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Loader2, X } from "lucide-react";
import { ItemSelection, VolLookupResult } from "./BulkLookupModal";
import { EnMeaningSelector } from "./EnMeaningSelector";

interface LookupRowProps {
  item: VolLookupResult;
  selection: ItemSelection | undefined;
  onUpdateSelection: (sel: ItemSelection) => void;
  onToggleRow: (checked: boolean) => void;
  onIgnore: () => void;
}

export const LookupRow: React.FC<LookupRowProps> = ({
  item,
  selection,
  onUpdateSelection,
  onToggleRow,
  onIgnore,
}) => {
  const { original, draft, status } = item;

  if (status === "loading") {
    return (
      <tr className="animate-pulse opacity-60">
        <td className="p-3 font-bold border-r flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" /> {original.text}
        </td>
        <td colSpan={4} className="p-3 text-xs text-muted-foreground italic">
          Fetching...
        </td>
      </tr>
    );
  }

  if (status === "not-found" || !draft) {
    return (
      <tr className="bg-red-50/30 dark:bg-red-900/10">
        <td className="p-3 font-bold text-destructive border-r flex items-center gap-2">
          {original.text}
        </td>
        <td colSpan={3} className="p-3 text-xs text-muted-foreground italic">
          <div className="flex items-center">
            No data found.
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-auto"
              onClick={onIgnore}
            >
              <X size={14} />
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  if (!selection) return null;

  // -- NOTE HELPERS --
  const handleNoteChange = (newIndices: number[]) => {
    onUpdateSelection({
      ...selection,
      selectedEnMeaningIndices: newIndices,
    });
  };

  // -- POS HELPERS --
  const toggleSinglePos = (pos: PartOfSpeech) => {
    const currentPos = selection.selectedPos;
    const isSelected = currentPos.includes(pos);
    const newPos = isSelected
      ? currentPos.filter((p) => p !== pos)
      : [...currentPos, pos];
    onUpdateSelection({ ...selection, selectedPos: newPos });
  };

  return (
    <tr className="group hover:bg-muted/30 transition-colors">
      {/* 1. WORD */}
      <td className="p-3 align-top border-r font-medium">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`word-${original.id}`}
            checked={selection.rowSelected}
            onCheckedChange={(c: CheckedState) => onToggleRow(c === true)}
          />
          <label
            htmlFor={`word-${original.id}`}
            className="text-primary text-base "
          >
            {original.text}
          </label>
        </div>
      </td>

      {/* 2. PHONETICS */}
      <td className="p-3 align-top border-r">
        {draft.phonetics.length > 0 ? (
          <div className="flex gap-2 items-start">
            <Checkbox
              id={`phonetics-${original.id}`}
              checked={selection.phonetics}
              onCheckedChange={(c: CheckedState) =>
                onUpdateSelection({ ...selection, phonetics: c === true })
              }
            />
            <label
              htmlFor={`phonetics-${original.id}`}
              className={`flex flex-col gap-1 text-xs ${
                selection.phonetics
                  ? "text-blue-700 dark:text-blue-400"
                  : "text-muted-foreground opacity-50"
              }`}
            >
              {draft.phonetics.map((p, i) => (
                <div key={i} className="font-mono whitespace-nowrap">
                  <span className="text-[10px] text-muted-foreground mr-1 uppercase">
                    {p.accent || "-"}
                  </span>
                  /{p.text}/
                </div>
              ))}
            </label>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )}
      </td>

      {/* 3. TYPE (POS) - INDIVIDUAL CHECKBOXES */}
      <td className="p-3 align-top border-r">
        {draft.partOfSpeech.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {draft.partOfSpeech.map((pos) => {
              const isPosSelected = selection.selectedPos.includes(pos);
              return (
                <div key={pos} className="flex items-center gap-2">
                  <Checkbox
                    id={`pos-${original.id}-${pos}`}
                    checked={isPosSelected}
                    onCheckedChange={() => toggleSinglePos(pos)}
                  />
                  <label
                    htmlFor={`pos-${original.id}-${pos}`}
                    className={`text-xs ${
                      isPosSelected
                        ? "text-blue-700 dark:text-blue-400 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {pos}
                  </label>
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )}
      </td>

      {/* 4. NOTE (Example) */}
      <td className="p-3 align-top">
        <div className="max-h-[200px] overflow-auto">
          <EnMeaningSelector
            meanings={draft.enMeanings}
            selectedIndices={selection.selectedEnMeaningIndices}
            onSelectionChange={handleNoteChange}
            idPrefix={`note-${original.id}`}
          />
        </div>
      </td>
    </tr>
  );
};
