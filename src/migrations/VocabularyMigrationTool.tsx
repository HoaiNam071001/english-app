import { db } from "@/firebaseConfig";
import { DataTable, VocabularyItem } from "@/types";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  AlertTriangle,
  ArrowRight,
  Database,
  Loader2,
  RefreshCcw,
  Search,
} from "lucide-react";
import { useState } from "react";

export const VocabularyMigrationTool = () => {
  // Input State
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");

  // Data State
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0); // 0 -> 100%
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // 1. Tìm kiếm từ vựng theo Source User ID
  const handleFetch = async () => {
    if (!sourceId.trim()) {
      alert("Vui lòng nhập User ID cũ (Source)");
      return;
    }
    setLoading(true);
    setItems([]);
    setStatusMsg(null);

    try {
      const q = query(
        collection(db, DataTable.Vocabulary),
        where("userId", "==", sourceId.trim())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setStatusMsg("Không tìm thấy từ vựng nào cho User ID này.");
      } else {
        const foundItems = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as VocabularyItem[];
        setItems(foundItems);
        setStatusMsg(`Tìm thấy ${foundItems.length} từ vựng.`);
      }
    } catch (error) {
      console.error(error);
      setStatusMsg("Lỗi khi tải dữ liệu. Xem console.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Thực hiện Migration (Batch Update)
  const handleMigrate = async () => {
    if (!targetId.trim()) {
      alert("Vui lòng nhập User ID mới (Target)");
      return;
    }
    if (sourceId === targetId) {
      alert("Source ID và Target ID không được giống nhau.");
      return;
    }
    if (
      !window.confirm(
        `Bạn có chắc muốn chuyển ${items.length} từ sang User mới không?`
      )
    ) {
      return;
    }

    setMigrating(true);
    setProgress(0);

    try {
      // Firestore giới hạn 500 writes mỗi batch
      const BATCH_SIZE = 500;
      const totalBatches = Math.ceil(items.length / BATCH_SIZE);
      let processedCount = 0;

      for (let i = 0; i < totalBatches; i++) {
        const batch = writeBatch(db);
        const start = i * BATCH_SIZE;
        const end = start + BATCH_SIZE;
        const chunk = items.slice(start, end);

        chunk.forEach((item) => {
          const docRef = doc(db, DataTable.Vocabulary, item.id);
          batch.update(docRef, {
            userId: targetId.trim(),
          });
        });

        await batch.commit();

        // Update Progress UI
        processedCount += chunk.length;
        setProgress(Math.round((processedCount / items.length) * 100));
      }

      setStatusMsg("✅ Migration thành công!");
      setItems([]); // Clear list sau khi xong để tránh bấm nhầm
      setSourceId("");
      setTargetId("");
    } catch (error) {
      console.error(error);
      setStatusMsg("❌ Có lỗi xảy ra trong quá trình migrate.");
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-background text-foreground border rounded-lg shadow-sm">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
          <RefreshCcw className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Vocabulary Owner Transfer</h2>
          <p className="text-sm text-muted-foreground">
            Chuyển toàn bộ từ vựng từ User cũ sang User mới.
          </p>
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            From Source User ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              placeholder="e.g. minhle (old)"
              className="flex-1 px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
            />
            <button
              onClick={handleFetch}
              disabled={loading || migrating}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md border flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Scan
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center md:pb-3 text-muted-foreground">
          <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            To Target User ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="e.g. KHGIGHYUY (new UID)"
              className="flex-1 px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* STATUS & FEEDBACK */}
      {statusMsg && (
        <div
          className={`p-3 rounded-md text-sm font-medium flex items-center gap-2 ${
            statusMsg.includes("✅")
              ? "bg-green-100 text-green-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          <Database className="w-4 h-4" />
          {statusMsg}
        </div>
      )}

      {/* PROGRESS BAR */}
      {migrating && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Migrating...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* PREVIEW LIST */}
      {items.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Previewing <b>{items.length}</b> items from source.
            </div>
            <button
              onClick={handleMigrate}
              disabled={migrating || !targetId}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
            >
              {migrating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4" />
              )}
              Start Transfer
            </button>
          </div>

          <div className="border rounded-md max-h-[300px] overflow-auto bg-card">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2">Word</th>
                  <th className="px-4 py-2">Meaning</th>
                  <th className="px-4 py-2">Current Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="px-4 py-2 font-medium">{item.text}</td>
                    <td className="px-4 py-2 text-muted-foreground truncate max-w-[200px]">
                      {item.meaning}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-red-500 bg-red-50 dark:bg-red-900/20 w-max rounded px-2">
                      {item.userId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs rounded-md">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Lưu ý: Hành động này sẽ thay đổi trường <code>userId</code> của
              tất cả các từ trong danh sách trên sang ID mới. Dữ liệu cũ sẽ
              không còn thuộc về user cũ nữa. Hãy kiểm tra kỹ <b>Target ID</b>{" "}
              trước khi bấm nút.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
