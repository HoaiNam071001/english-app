import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AddReport, VocabularyItem } from "@/types";
import { Loader2, Plus } from "lucide-react";
import React, { useState } from "react";

interface CreateVocabularyModalProps {
  onAddVocabulary: (entries: Partial<VocabularyItem>[]) => Promise<AddReport>;
  onSuccess?: () => void;
}

const CreateVocabularyModal: React.FC<CreateVocabularyModalProps> = ({
  onAddVocabulary,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<AddReport | null>(null);

  const handleProcessAndAdd = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setReport(null);

    // 1. Xử lý logic tách chuỗi (Parsing Logic)
    const rawLines = inputText.split(/[\n;]+/);

    // Cập nhật type định nghĩa có thêm example
    const newEntries: {
      text: string;
      meaning: string;
      normalized: string;
      example: string;
    }[] = [];

    rawLines.forEach((line) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      let english = "";
      let vietnamese = "";
      let example = "";

      // Bước 1: Tách phần Example ra trước (ngăn cách bởi dấu |)
      // Ví dụ: "mean: ý nghĩa | ví dụ giải thích" -> ["mean: ý nghĩa", "ví dụ giải thích"]
      let contentPart = cleanLine; // Phần chứa word: meaning

      if (cleanLine.includes("|")) {
        const parts = cleanLine.split("|");
        contentPart = parts[0].trim();
        // Lấy tất cả phần sau dấu | đầu tiên làm example (đề phòng user gõ nhiều dấu |)
        example = parts.slice(1).join("|").trim();
      }

      // Bước 2: Tách Word và Meaning từ phần contentPart (ngăn cách bởi dấu :)
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

    // 2. Gọi hàm từ Hook để lưu vào DB
    try {
      const result = await onAddVocabulary(newEntries);
      setReport(result);

      if (result.added.length > 0) {
        setInputText("");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error adding words:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="secondary">
          <Plus size={16} /> Add New Words
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Vocabulary</DialogTitle>
          <DialogDescription>
            Enter words in format: <code>Word: Meaning | Example</code>. <br />
            Or simple format: <code>Word: Meaning</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Textarea
            placeholder={`mean: ý nghĩa | phần giải thích\nHello | He said hello to me\nApple: Quả táo`}
            className="min-h-[200px] font-mono text-sm"
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
                    Duplicate ({report.skipped.length}):{" "}
                    {report.skipped.join(", ")}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            onClick={handleProcessAndAdd}
            disabled={loading || !inputText}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Processing..." : "Save to Library"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVocabularyModal;
