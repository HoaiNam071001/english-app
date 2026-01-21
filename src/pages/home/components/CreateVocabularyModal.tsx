import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { AddReport, VocabularyItem } from "@/types";
import { Loader2, Plus, Trash2, Save, FileText, List } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast"; // Import hook toast của bạn
import { ImageIllustration } from "@/components/ImageIllustration";
import useLocalStorage from "@/hooks/useLocalStorage";
import { STORAGE_KEY } from "@/constants";

// ==========================================
// 1. SUB-COMPONENT: ROW ITEM (Một dòng nhập liệu)
// ==========================================
interface VocabularyRowProps {
  id: string; // Dùng ID tạm để làm key cho React
  data: Partial<VocabularyItem>;
  onChange: (id: string, field: keyof VocabularyItem, value: string) => void;
  onRemove: (id: string) => void;
  onSave: (id: string) => Promise<void>; // Hàm save riêng cho từng dòng
}

const VocabularyRow: React.FC<VocabularyRowProps> = ({
  id,
  data,
  onChange,
  onRemove,
  onSave,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveClick = async () => {
    setIsSaving(true);
    await onSave(id);
    setIsSaving(false);
  };

  return (
    <div className="flex gap-3 items-start p-3 border rounded-md bg-background hover:bg-accent/10 transition-colors shadow-sm">
      <div className="shrink-0">
        <ImageIllustration
          className="w-18 h-18  md:w-25 md:h-25"
          url={data.imageUrl || ""}
          onApply={(newUrl) => onChange(id, "imageUrl", newUrl)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
        <div className="space-y-2">
          {/* Word Input */}
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold">
              Word
            </Label>
            <Input
              placeholder="e.g. Apple"
              value={data.text || ""}
              onChange={(e) => onChange(id, "text", e.target.value)}
              className="h-9 text-sm font-semibold "
              disabled={isSaving}
            />
          </div>

          {/* Meaning Input */}
          <div className="">
            <Input
              placeholder="Meaning"
              value={data.meaning || ""}
              onChange={(e) => onChange(id, "meaning", e.target.value)}
              className="h-9 text-sm"
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Example Input (Textarea) */}
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground uppercase font-bold">
            Note
          </Label>
          <Textarea
            placeholder="Example sentence..."
            value={data.example || ""}
            onChange={(e) => onChange(id, "example", e.target.value)}
            className="min-h-[36px] h-9 text-xs py-2 leading-tight resize-none focus:h-20 transition-all z-10 relative"
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mt-6">
        <Button
          size="icon"
          className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleSaveClick}
          disabled={isSaving || !data.text}
          title="Save this item"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Save size={14} />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onRemove(id)}
          disabled={isSaving}
          title="Remove row"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};

// ==========================================
// 2. SUB-COMPONENT: STRUCTURED IMPORT TAB (Tab mới)
// ==========================================
interface StructuredImportTabProps {
  onAdd: (entries: Partial<VocabularyItem>[]) => Promise<AddReport>;
  onSuccess: () => void; // Trigger khi cần refresh list bên ngoài
}

// Helper type cho row nội bộ có ID
type RowItem = Partial<VocabularyItem> & { _id: string };

const StructuredImportTab: React.FC<StructuredImportTabProps> = ({
  onAdd,
  onSuccess,
}) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Dùng _id để làm key, giúp React không bị render sai khi xóa phần tử ở giữa
  const [rows, setRows] = useState<RowItem[]>([
    {
      _id: crypto.randomUUID(),
      text: "",
      meaning: "",
      example: "",
      imageUrl: "",
    },
  ]);
  const isValid = rows?.every((e) => e.text);

  const addRow = () => {
    setRows([
      ...rows,
      {
        _id: crypto.randomUUID(),
        text: "",
        meaning: "",
        example: "",
        imageUrl: "",
      },
    ]);
  };

  const removeRow = (id: string) => {
    // Cho phép xóa hết, nếu xóa hết thì tự thêm lại 1 dòng trống
    const newRows = rows.filter((r) => r._id !== id);
    if (newRows.length === 0) {
      setRows([
        {
          _id: crypto.randomUUID(),
          text: "",
          meaning: "",
          example: "",
          imageUrl: "",
        },
      ]);
    } else {
      setRows(newRows);
    }
  };

  const updateRow = (
    id: string,
    field: keyof VocabularyItem,
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((row) => (row._id === id ? { ...row, [field]: value } : row)),
    );
  };

  // Xử lý lưu từng dòng riêng biệt
  const handleSaveSingleRow = async (id: string) => {
    const rowToSave = rows.find((r) => r._id === id);
    if (!rowToSave || !rowToSave.text?.trim()) {
      toast.error("Please enter a word.");
      return;
    }

    // Prepare data
    const entry: Partial<VocabularyItem> = {
      text: rowToSave.text.trim(),
      meaning: rowToSave.meaning?.trim(),
      example: rowToSave.example?.trim(),
      imageUrl: rowToSave.imageUrl?.trim(),
      normalized: rowToSave.text.trim().toLowerCase(),
    };

    try {
      const result = await onAdd([entry]);

      if (result.added.length > 0) {
        toast.success(`Saved "${entry.text}" successfully!`);
        removeRow(id);
        onSuccess();
      } else if (result.skipped.length > 0) {
        toast.error(`"${entry.text}" already exists in the library!`);
      }
    } catch (error) {
      console.error("Error saving word:", error);
      toast.error("Failed to save word.");
    }
  };

  const handleSave = async () => {
    // 1. Filter empty rows (rows without text)
    const validRows = rows.filter((r) => r.text && r.text.trim() !== "");

    if (validRows.length === 0) {
      toast.error("Please enter at least one word.");
      return;
    }

    // 2. Check for duplicates within the current list
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    validRows.forEach((row) => {
      const normalized = row.text!.trim().toLowerCase();
      if (seen.has(normalized)) {
        duplicates.add(row.text!);
      }
      seen.add(normalized);
    });

    if (duplicates.size > 0) {
      toast.error(
        `Duplicate words found in list: ${Array.from(duplicates).join(", ")}`,
      );
      return;
    }

    // 3. Prepare data
    const entries = validRows.map((r) => ({
      ...r,
      text: r.text!.trim(),
      meaning: r.meaning?.trim(),
      example: r.example?.trim(),
      imageUrl: r.imageUrl?.trim(),
      normalized: r.text!.trim().toLowerCase(),
    }));

    // 4. Submit
    setLoading(true);
    try {
      const result = await onAdd(entries);
      if (result.added.length > 0) {
        setRows([
          {
            _id: crypto.randomUUID(),
            text: "",
            meaning: "",
            example: "",
            imageUrl: "",
          },
        ]);
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding words:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2 overflow-hidden">
      <div className="flex items-center px-1">
        <Button
          variant="outline"
          size="sm"
          onClick={addRow}
          className="h-7 gap-1 ml-auto"
        >
          <Plus size={14} /> Add Line
        </Button>
      </div>

      <ScrollArea className="flex-1 pr-4 -mr-4 overflow-auto">
        <div className="space-y-3 pb-4 p-1">
          {rows.map((row) => (
            <VocabularyRow
              key={row._id}
              id={row._id}
              data={row}
              onChange={updateRow}
              onRemove={removeRow}
              onSave={handleSaveSingleRow}
            />
          ))}

          {rows.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              All items saved! <br />
              <Button variant="link" onClick={addRow}>
                Add more words
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={loading || !isValid}
          className="gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={16} />}
          Save
        </Button>
      </div>
    </div>
  );
};

// ==========================================
// 3. SUB-COMPONENT: RAW TEXT IMPORT TAB (Tab cũ - Refactored)
// ==========================================
interface RawTextImportTabProps {
  onAdd: (entries: Partial<VocabularyItem>[]) => Promise<AddReport>;
  onSuccess: () => void;
}

const RawTextImportTab: React.FC<RawTextImportTabProps> = ({
  onAdd,
  onSuccess,
}) => {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AddReport | null>(null);

  const handleProcessAndAdd = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setReport(null);

    const rawLines = inputText.split(/[\n;]+/);
    const newEntries: Partial<VocabularyItem>[] = [];

    rawLines.forEach((line) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      let english = "";
      let vietnamese = "";
      let example = "";

      let contentPart = cleanLine;
      if (cleanLine.includes("|")) {
        const parts = cleanLine.split("|");
        contentPart = parts[0].trim();
        example = parts.slice(1).join("|").trim();
      }

      if (contentPart.includes(":")) {
        const parts = contentPart.split(":");
        english = parts[0].trim();
        vietnamese = parts.slice(1).join(":").trim();
      } else {
        english = contentPart;
      }

      if (english) {
        newEntries.push({
          text: english,
          meaning: vietnamese,
          normalized: english.toLowerCase(),
          example: example,
        });
      }
    });

    try {
      const result = await onAdd(newEntries);
      setReport(result);
      if (result.added.length > 0) {
        setInputText("");
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 overflow-hidden h-full">
      <div className="bg-muted/30 p-3 rounded text-sm text-muted-foreground space-y-1">
        <p>
          Format:{" "}
          <code className="text-blue-600 font-bold">
            Word: Meaning | Example
          </code>
        </p>
        <p>
          Or simple:{" "}
          <code className="text-blue-600 font-bold">Word: Meaning</code>
        </p>
      </div>

      <Textarea
        placeholder={`mean: ý nghĩa | phần giải thích\nHello | He said hello to me\nApple: Quả táo`}
        className="font-mono text-sm flex-1 overflow-auto mb-4"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={loading}
      />

      {report && (
        <div className="text-sm space-y-2 bg-muted/50 p-3 rounded-md border max-h-[150px] overflow-y-auto">
          {report.added.length > 0 && (
            <div className="text-green-600 flex items-start gap-2">
              <span>✅</span>
              <span>
                Added ({report.added.length}): {report.added.join(", ")}
              </span>
            </div>
          )}
          {report.skipped.length > 0 && (
            <div className="text-red-500 flex items-start gap-2">
              <span>⚠️</span>
              <span>
                Duplicate ({report.skipped.length}): {report.skipped.join(", ")}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end mt-auto">
        <Button onClick={handleProcessAndAdd} disabled={loading || !inputText}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN COMPONENT
// ==========================================
enum CreateVolMode {
  Structured = "structured",
  Raw = "raw",
}

interface CreateVocabularyModalProps {
  onAddVocabulary: (entries: Partial<VocabularyItem>[]) => Promise<AddReport>;
  onSuccess?: () => void;
}

const CreateVocabularyModal: React.FC<CreateVocabularyModalProps> = ({
  onAddVocabulary,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const { getStorage, setStorage } = useLocalStorage();
  const [defaultTab, setDefaultTab] = useState(
    getStorage(STORAGE_KEY.HOME_CREATE_MODE) || CreateVolMode.Raw,
  );

  const onModeChange = (val: CreateVolMode) => {
    setDefaultTab(val);
    setStorage(STORAGE_KEY.HOME_CREATE_MODE, val);
  };

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="secondary">
          <Plus size={16} /> Add New Words
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Vocabulary</DialogTitle>
          <DialogDescription>
            Add new words to your library using one of the methods below.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue={defaultTab}
          className="w-full flex-1 flex flex-col overflow-hidden"
          onValueChange={onModeChange}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value={CreateVolMode.Raw} className="gap-2">
              <FileText size={16} /> Raw Text
            </TabsTrigger>
            <TabsTrigger value={CreateVolMode.Structured} className="gap-2">
              <List size={16} /> Structured List
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent
              value={CreateVolMode.Structured}
              className="h-[60vh] mt-0"
            >
              <StructuredImportTab
                onAdd={onAddVocabulary}
                onSuccess={handleSuccess}
              />
            </TabsContent>

            <TabsContent value={CreateVolMode.Raw} className="h-[60vh] mt-0">
              <RawTextImportTab
                onAdd={onAddVocabulary}
                onSuccess={handleSuccess}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVocabularyModal;
