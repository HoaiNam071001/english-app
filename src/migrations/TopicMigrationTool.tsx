import { db } from "@/firebaseConfig";
import { DataTable, TopicItem } from "@/types";
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
  FolderOpen, // Icon cho Topic
  Loader2,
  RefreshCcw,
  Search,
  Tags,
} from "lucide-react";
import { useState } from "react";

export const TopicMigrationTool = () => {
  // Input State
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");

  // Data State
  const [items, setItems] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // 1. Tìm kiếm Topics theo Source User ID
  const handleFetch = async () => {
    if (!sourceId.trim()) {
      alert("Vui lòng nhập User ID cũ (Source)");
      return;
    }
    setLoading(true);
    setItems([]);
    setStatusMsg(null);

    try {
      // [CHANGE] Trỏ vào DataTable.Topics
      const q = query(
        collection(db, DataTable.Topics),
        where("userId", "==", sourceId.trim())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setStatusMsg("Không tìm thấy Topic nào cho User ID này.");
      } else {
        const foundItems = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as TopicItem[];
        setItems(foundItems);
        setStatusMsg(`Tìm thấy ${foundItems.length} Topics.`);
      }
    } catch (error) {
      console.error(error);
      setStatusMsg("Lỗi khi tải dữ liệu. Xem console.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Thực hiện Migration
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
        `Bạn có chắc muốn chuyển ${items.length} Topics sang User mới không?`
      )
    ) {
      return;
    }

    setMigrating(true);
    setProgress(0);

    try {
      const BATCH_SIZE = 500;
      const totalBatches = Math.ceil(items.length / BATCH_SIZE);
      let processedCount = 0;

      for (let i = 0; i < totalBatches; i++) {
        const batch = writeBatch(db);
        const start = i * BATCH_SIZE;
        const end = start + BATCH_SIZE;
        const chunk = items.slice(start, end);

        chunk.forEach((item) => {
          // [CHANGE] Update vào bảng Topics
          const docRef = doc(db, DataTable.Topics, item.id);
          batch.update(docRef, {
            userId: targetId.trim(),
            // Không nhất thiết update serverTimestamp nếu muốn giữ nguyên ngày tạo gốc,
            // nhưng có thể update để biết record vừa bị tác động.
            // updatedAt: serverTimestamp(),
          });
        });

        await batch.commit();

        processedCount += chunk.length;
        setProgress(Math.round((processedCount / items.length) * 100));
      }

      setStatusMsg("✅ Migration Topics thành công!");
      setItems([]);
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
        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
          <FolderOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Topics Owner Transfer</h2>
          <p className="text-sm text-muted-foreground">
            Chuyển quyền sở hữu các chủ đề (Topics) sang User mới.
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
              className="flex-1 px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm"
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
              placeholder="e.g. UID_NEW_123"
              className="flex-1 px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm"
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
              className="h-full bg-orange-600 transition-all duration-300"
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
              Previewing <b>{items.length}</b> topics.
            </div>
            <button
              onClick={handleMigrate}
              disabled={migrating || !targetId}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
            >
              {migrating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4" />
              )}
              Transfer Topics
            </button>
          </div>

          <div className="border rounded-md max-h-[300px] overflow-auto bg-card">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2">Label</th>
                  <th className="px-4 py-2">Icon/Color</th>
                  <th className="px-4 py-2">Current Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="px-4 py-2 font-medium flex items-center gap-2">
                      <Tags className="w-3 h-3 text-muted-foreground" />
                      {item.label}
                    </td>
                    <td className="px-4 py-2">
                      {/* Hiển thị màu hoặc icon demo nếu có */}
                      <div className="flex items-center gap-2">
                        {item.color && (
                          <span
                            className={`w-4 h-4 rounded-full border shadow-sm ${
                              "bg-" + item.color + "-500"
                            }`}
                            style={{ backgroundColor: item.color }}
                          ></span>
                        )}
                        <span className="text-xs text-muted-foreground font-mono">
                          {item.icon || "No Icon"}
                        </span>
                      </div>
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
              Chú ý: Bạn đang thao tác trên bảng <b>Topics</b>. Đảm bảo bạn cũng
              chạy tool VocabularyMigrationTool để đồng bộ cả từ vựng nhé.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
