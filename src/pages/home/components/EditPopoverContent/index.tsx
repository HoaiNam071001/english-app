import { SimpleTooltip } from "@/components/SimpleTooltip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useDictionary } from "@/hooks/useDictionary";
import { useToast } from "@/hooks/useToast";
import { AccentType, PartOfSpeech, VocabularyItem } from "@/types";
import { mapApiToVocabularyItem } from "@/utils/vocabularyHelper";
import { ChevronDown, Loader2, Plus, Save, Search, Trash2 } from "lucide-react";
import React, { useState } from "react";
import TopicSelector from "../common/TopicSelector";
import { DraftSelectionView } from "./DraftSelectionView";
import { PhoneticRow } from "./PhoneticRow";

interface EditPopoverContentProps {
  word: VocabularyItem;
  onSave: (id: string, updates: Partial<VocabularyItem>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const EditPopoverContent: React.FC<EditPopoverContentProps> = ({
  word,
  onSave,
  onDelete,
  onClose,
}) => {
  const { lookupWords, loading: apiLoading } = useDictionary();
  const toast = useToast();

  // State chính
  const [form, setForm] = useState<Partial<VocabularyItem>>({
    text: word.text,
    meaning: word.meaning,
    example: word.example || "",
    topicId: word.topicId || null,
    phonetics: word.phonetics || [],
    partOfSpeech: word.partOfSpeech || [],
  });

  // State Draft: Nếu có data -> Hiện màn hình chọn field
  const [draft, setDraft] = useState<Partial<VocabularyItem> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // --- HANDLERS ---
  const handleSave = () => {
    if (!word.id) return;
    onSave(word.id, form);
    onClose();
  };

  const handleFind = async () => {
    if (!form.text) return;
    const results = await lookupWords([form.text]);
    if (results && results.length > 0) {
      const newDraft = mapApiToVocabularyItem({}, results[0]);
      setDraft(newDraft); // Trigger chuyển màn hình sang Draft Selection
    } else {
      toast.error("Word not found");
    }
  };

  const togglePos = (pos: PartOfSpeech) => {
    const current = form.partOfSpeech || [];
    if (current.includes(pos)) {
      setForm({ ...form, partOfSpeech: current.filter((p) => p !== pos) });
    } else {
      setForm({ ...form, partOfSpeech: [...current, pos] });
    }
  };

  // --- RENDERS ---

  // 1. Màn hình DELETE CONFIRM
  if (showDeleteConfirm) {
    return (
      <div className="space-y-3 w-72">
        <h4 className="font-medium text-sm text-destructive">
          Confirm deletion?
        </h4>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              if (word.id) onDelete(word.id);
              onClose();
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }

  // 2. Màn hình DRAFT SELECTION (Overlay)
  if (draft) {
    return (
      <DraftSelectionView
        draft={draft}
        currentForm={form}
        onApply={(selectedData) => {
          setForm((prev) => ({ ...prev, ...selectedData }));
          setDraft(null);
        }}
        onCancel={() => setDraft(null)}
      />
    );
  }

  // 3. Màn hình EDIT CHÍNH
  return (
    <div className="w-[350px] max-h-[400px] pr-1 flex flex-col">
      {/* Header Compact */}
      <div className="flex items-center justify-between pb-1 border-b">
        <h4 className="font-semibold text-sm">Edit Vocabulary</h4>
        {/* Nút delete nhỏ ở header */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <div className="flex-1 overflow-auto gap-2 flex flex-col my-2">
        {/* 1. WORD & FIND */}
        <div className="space-y-1">
          <Label htmlFor="text" className="text-xs text-muted-foreground">
            Word
          </Label>
          <div className="relative">
            <Input
              id="text"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              className="h-8 text-sm font-bold pr-8"
            />
            <SimpleTooltip content="Find more information">
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-6 w-6 text-muted-foreground hover:text-primary m-1"
                onClick={handleFind}
                disabled={apiLoading}
              >
                {apiLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Search size={14} />
                )}
              </Button>
            </SimpleTooltip>
          </div>
        </div>

        {/* 2. PART OF SPEECH */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Part of Speech
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between h-8 px-2 text-left font-normal"
              >
                <span className="truncate text-xs">
                  {form.partOfSpeech && form.partOfSpeech.length > 0 ? (
                    <span className="text-foreground font-medium">
                      {form.partOfSpeech.join(", ")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">
                      Select type...
                    </span>
                  )}
                </span>
                <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[280px]" align="start">
              <ScrollArea className="h-[200px]">
                {Object.values(PartOfSpeech).map((pos) => (
                  <div
                    key={pos}
                    className="flex items-center space-x-2 p-1.5 hover:bg-accent cursor-pointer rounded-sm"
                    onClick={() => togglePos(pos)}
                  >
                    <Checkbox
                      checked={form.partOfSpeech?.includes(pos)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-xs">{pos}</span>
                  </div>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 3. PHONETICS (List Rows) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Phonetics</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 hover:bg-transparent text-blue-600"
              onClick={() =>
                setForm({
                  ...form,
                  phonetics: [
                    ...(form.phonetics || []),
                    { text: "", accent: AccentType.US, audio: "" },
                  ],
                })
              }
            >
              <Plus size={14} />
            </Button>
          </div>

          <div className="space-y-1">
            {form.phonetics?.map((pho, index) => (
              <PhoneticRow
                key={index}
                item={pho}
                onUpdate={(updatedItem) => {
                  const newArr = [...(form.phonetics || [])];
                  newArr[index] = updatedItem;
                  setForm({ ...form, phonetics: newArr });
                }}
                onDelete={() => {
                  const newArr = form.phonetics?.filter((_, i) => i !== index);
                  setForm({ ...form, phonetics: newArr });
                }}
              />
            ))}
            {(!form.phonetics || form.phonetics.length === 0) && (
              <div className="text-[10px] text-muted-foreground italic text-center py-2 bg-muted/30 rounded-sm border border-dashed">
                No phonetics.
              </div>
            )}
          </div>
        </div>

        {/* 4. MEANING */}
        <div className="space-y-1">
          <Label htmlFor="meaning" className="text-xs text-muted-foreground">
            Meaning (VN)
          </Label>
          <Input
            id="meaning"
            value={form.meaning}
            onChange={(e) => setForm({ ...form, meaning: e.target.value })}
            className="h-8 text-sm"
          />
        </div>

        {/* 5. TOPIC */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Topic</Label>
          <TopicSelector
            value={form.topicId || null}
            onChange={(val) => setForm({ ...form, topicId: val })}
          />
        </div>

        {/* 6. EXAMPLE */}
        <div className="space-y-1">
          <Label htmlFor="example" className="text-xs text-muted-foreground">
            Example
          </Label>
          <Textarea
            id="example"
            value={form.example}
            onChange={(e) => setForm({ ...form, example: e.target.value })}
            className="text-xs min-h-[50px] leading-snug"
            placeholder="E.g. Example sentence..."
          />
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-end gap-2 pt-2 mt-1 border-t">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button size="sm" className="h-7 text-xs" onClick={handleSave}>
          <Save size={14} className="mr-1.5" /> Save
        </Button>
      </div>
    </div>
  );
};
