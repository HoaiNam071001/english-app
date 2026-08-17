import DictionarySearchButton from "@/components/DictionarySearchButton";
import { ImageIllustration } from "@/components/ImageIllustration";
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
import { AccentType, PartOfSpeech, VocabularyItem, WordData } from "@/types";
import { ChevronDown, Loader2, Plus, Save, Search, Trash2 } from "lucide-react";
import React, { useState } from "react";
import TopicSelector from "../common/TopicSelector";
import WordTypeSelector from "../common/WordTypeSelector"; // <--- Import mới
import { DraftSelectionView } from "./DraftSelectionView";
import { PhoneticRow } from "./PhoneticRow";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["home", "common"]);
  const { lookupWords, loading: apiLoading } = useDictionary();
  const toast = useToast();

  // State Form
  const [form, setForm] = useState<Partial<VocabularyItem>>({
    text: word.text,
    meaning: word.meaning,
    example: word.example || "",
    topicId: word.topicId || null,
    phonetics: word.phonetics || [],
    partOfSpeech: word.partOfSpeech || [],
    typeIds: word.typeIds || [],
    imageUrl: word.imageUrl || "",
  });

  // State Draft: Lưu WordData thô từ API
  const [draft, setDraft] = useState<WordData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // --- HANDLERS ---
  const handleFind = async () => {
    if (!form.text) return;
    const results = await lookupWords([form.text]);

    if (results && results.length > 0) {
      setDraft(results[0]);
    } else {
      toast.error(t("edit.wordNotFound"));
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

  const handleSave = () => {
    if (!word.id) return;
    onSave(word.id, form);
    onClose();
  };

  // --- RENDERS ---

  if (showDeleteConfirm) {
    return (
      <div className="space-y-3 md:w-72">
        <h4 className="font-medium text-sm text-destructive">
          {t("edit.confirmDelete")}
        </h4>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowDeleteConfirm(false)}
          >
            {t("common:actions.cancel")}
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
            {t("common:actions.delete")}
          </Button>
        </div>
      </div>
    );
  }

  // Màn hình DRAFT SELECTION
  if (draft) {
    return (
      <DraftSelectionView
        data={draft}
        origin={form}
        onApply={(selectedData) => {
          setForm((prev) => ({ ...prev, ...selectedData }));
          setDraft(null);
        }}
        onCancel={() => setDraft(null)}
      />
    );
  }

  // Màn hình EDIT CHÍNH
  return (
    <div className="md:w-[500px] md:min-h-[500px] max-h-[600px] flex flex-col">
      <div className="flex-1 overflow-auto gap-3 flex flex-col my-2">
        {/* WORD & FIND */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Ảnh minh họa - Xếp bên trái */}
          <ImageIllustration
            url={form.imageUrl || ""}
            onApply={(newUrl) => setForm({ ...form, imageUrl: newUrl })}
          />

          {/* Word Input - Chiếm phần còn lại */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-4">
              <Label
                htmlFor="text"
                className="text-xs text-muted-foreground mr-auto"
              >
                {t("edit.word")}
              </Label>
              <DictionarySearchButton text={form.text} showText />
            </div>
            <div className="relative">
              <Input
                id="text"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                className="h-8 text-sm font-bold pr-8"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-8 w-8 text-muted-foreground"
                onClick={handleFind}
                disabled={apiLoading}
              >
                {apiLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Search size={14} />
                )}
              </Button>
            </div>

            <div className="space-y-1 mt-2">
              <Label
                htmlFor="meaning"
                className="text-xs text-muted-foreground"
              >
                {t("edit.meaning")}
              </Label>
              <Input
                id="meaning"
                value={form.meaning}
                onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* PART OF SPEECH */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              {t("edit.partOfSpeech")}
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
                        {t("edit.selectType")}
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

          {/* WORD TYPE (NEW) */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              {t("edit.wordTypes")}
            </Label>
            <WordTypeSelector
              value={form.typeIds}
              onChange={(val) => setForm({ ...form, typeIds: val })}
            />
          </div>
        </div>

        {/* PHONETICS */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              {t("edit.phonetics")}
            </Label>
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
                wordText={form.text}
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
                {t("edit.noPhonetics")}
              </div>
            )}
          </div>
        </div>

        {/* TOPIC */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t("edit.topic")}</Label>
          <TopicSelector
            value={form.topicId || null}
            onChange={(val) => setForm({ ...form, topicId: val })}
            className="h-8 text-sm" // Force chiều cao giống input
          />
        </div>

        {/* NOTE */}
        <div className="space-y-1">
          <Label htmlFor="note" className="text-xs text-muted-foreground">
            {t("edit.note")}
          </Label>
          <Textarea
            id="note"
            value={form.example}
            onChange={(e) => setForm({ ...form, example: e.target.value })}
            className="text-xs min-h-[50px] leading-snug"
            placeholder={t("edit.notePlaceholder")}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-2 pt-4 mt-1 border-t">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 size={14} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs ml-auto"
          onClick={onClose}
        >
          {t("common:actions.cancel")}
        </Button>
        <Button size="sm" className="h-7 text-xs" onClick={handleSave}>
          <Save size={14} className="mr-1.5" /> {t("common:actions.save")}
        </Button>
      </div>
    </div>
  );
};
