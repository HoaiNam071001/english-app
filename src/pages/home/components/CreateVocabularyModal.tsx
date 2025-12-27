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
import { AddReport, VocabularyItem } from "@/types"; // Đảm bảo bạn đã định nghĩa type này
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

    // 1. Xử lý logic tách chuỗi (Parsing Logic) - Giữ tại UI
    const rawLines = inputText.split(/[\n;]+/);
    const newEntries: { text: string; meaning: string; normalized: string }[] =
      [];

    rawLines.forEach((line) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;
      let english = "";
      let vietnamese = "";

      if (cleanLine.includes(":")) {
        const parts = cleanLine.split(":");
        english = parts[0].trim();
        vietnamese = parts.slice(1).join(":").trim();
      } else {
        english = cleanLine;
      }

      if (english) {
        newEntries.push({
          text: english,
          meaning: vietnamese,
          normalized: english.toLowerCase(),
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
      setOpen(false);
    } catch (error) {
      console.error("Lỗi khi thêm từ:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="secondary">
          <Plus size={16} /> Thêm từ mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Từ Vựng</DialogTitle>
          <DialogDescription>
            Nhập danh sách theo định dạng: <code>Word: Meaning</code> hoặc{" "}
            <code>Word</code>. Xuống dòng để tách từ.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Textarea
            placeholder={`Hello: Xin chào\nApple\nDog: Con chó`}
            className="min-h-[150px]"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
          />

          {report && (
            <div className="text-sm space-y-2 bg-muted/50 p-3 rounded-md border">
              {report.added.length > 0 && (
                <div className="text-green-600 flex items-start gap-2">
                  <span>✅</span>
                  <span>
                    Đã thêm ({report.added.length}): {report.added.join(", ")}
                  </span>
                </div>
              )}
              {report.skipped.length > 0 && (
                <div className="text-red-500 flex items-start gap-2">
                  <span>⚠️</span>
                  <span>
                    Trùng ({report.skipped.length}): {report.skipped.join(", ")}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Đóng
          </Button>
          <Button
            onClick={handleProcessAndAdd}
            disabled={loading || !inputText}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Đang xử lý..." : "Lưu vào kho"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVocabularyModal;
