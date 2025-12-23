import React, { useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  serverTimestamp,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { AddReport, VocabularyItem } from "@/types";
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
import { Loader2, Plus } from "lucide-react"; // Icon từ lucide-react

interface CreateVocabularyModalProps {
  userEmail: string; // <--- MỚI
  onSuccess?: () => void;
}

const CreateVocabularyModal: React.FC<CreateVocabularyModalProps> = ({
  userEmail,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<AddReport | null>(null);

  const handleAddWords = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setReport(null);

    const rawLines = inputText.split(/[\n,]+/);
    const newEntries: Partial<VocabularyItem>[] = [];

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

    try {
      const q = query(
        collection(db, "vocabulary"),
        where("email", "==", userEmail)
      );
      const querySnapshot = await getDocs(q);
      const existingWordsSet = new Set<string>();
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        if (data.normalized) existingWordsSet.add(data.normalized);
      });

      const batch = writeBatch(db);
      const addedWords: string[] = [];
      const skippedWords: string[] = [];
      const currentBatchSet = new Set<string>();

      newEntries.forEach((entry) => {
        if (!entry.text || !entry.normalized) return;

        const isDuplicateInDb = existingWordsSet.has(entry.normalized);
        const isDuplicateInCurrentBatch = currentBatchSet.has(entry.normalized);

        if (isDuplicateInDb || isDuplicateInCurrentBatch) {
          skippedWords.push(entry.text);
        } else {
          const newDocRef = doc(collection(db, "vocabulary"));
          const docData = {
            text: entry.text,
            meaning: entry.meaning || "",
            normalized: entry.normalized,
            email: userEmail,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          batch.set(newDocRef, docData);
          currentBatchSet.add(entry.normalized);
          addedWords.push(entry.text);
        }
      });

      if (addedWords.length > 0) {
        await batch.commit();
        setInputText("");
        if (onSuccess) onSuccess();
      }

      setReport({ added: addedWords, skipped: skippedWords });
    } catch (error) {
      console.error("Error adding words:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
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
            <div className="text-sm space-y-2 bg-slate-50 p-3 rounded-md border">
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
          <Button onClick={handleAddWords} disabled={loading || !inputText}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Đang xử lý..." : "Lưu vào kho"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVocabularyModal;
