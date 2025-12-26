import { useState } from "react";
import { db, auth } from "@/firebaseConfig"; // Cần import auth để lấy current user
import { 
  collection, getDocs, doc, writeBatch, deleteField 
} from "firebase/firestore"; // Import deleteField
import { DataTable } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const MigrationTool = () => {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  const runMigration = async () => {
    if (!confirm("Hành động này sẽ XÓA field email cũ và thay bằng userId (UID). Bạn chắc chứ?")) return;
    
    setLoading(true);
    setLog([]);
    addLog("--- BẮT ĐẦU MIGRATE (EMAIL -> UID) ---");

    try {
      const currentUser = auth.currentUser;
      const batch = writeBatch(db);
      let operationCount = 0;
      const MAX_BATCH_SIZE = 450; 

      // 1. TẠO BẢN ĐỒ MAPPING: EMAIL -> UID
      // Chúng ta cần đọc collection Users để biết email nào ứng với UID nào
      addLog("⏳ Đang đọc danh sách Users để lấy UID...");
      const usersSnap = await getDocs(collection(db, DataTable.USER));
      const emailToUidMap = new Map<string, string>();

      usersSnap.forEach(doc => {
        const data = doc.data();
        // Giả sử trong User profile có lưu trường email
        if (data.email) {
            // doc.id ở đây chính là UID (do logic HomePage đã sửa)
            emailToUidMap.set(data.email, doc.id);
        }
      });
      addLog(`✅ Đã map được ${emailToUidMap.size} users.`);

      // 2. Lấy dữ liệu Vocabulary và Topics
      const vocabSnap = await getDocs(collection(db, DataTable.Vocabulary));
      const topicSnap = await getDocs(collection(db, DataTable.Topics));
      
      addLog(`🔎 Tìm thấy ${vocabSnap.size} từ vựng và ${topicSnap.size} chủ đề.`);

      // Hàm xử lý chung cho cả 2 collection
      let currentBatch = writeBatch(db);
      let batchCounter = 0;
      let successCount = 0;
      let skipCount = 0;

      const processDoc = async (docRef: any, data: any) => {
        // Chỉ xử lý nếu còn field email
        if (data.email) {
          let targetUid = "";

          // Ưu tiên 1: Nếu email trùng với người đang đăng nhập -> Lấy UID thật luôn
          if (currentUser && data.email === currentUser.email) {
            targetUid = currentUser.uid;
          } 
          // Ưu tiên 2: Tìm trong Map đã build ở bước 1
          else if (emailToUidMap.has(data.email)) {
            targetUid = emailToUidMap.get(data.email)!;
          }

          if (targetUid) {
            // Update: Thêm userId, Xóa email
            currentBatch.update(docRef, { 
                userId: targetUid,
                email: deleteField() // <--- LỆNH XÓA FIELD
            });
            
            successCount++;
            batchCounter++;

            // Commit nếu đầy batch
            if (batchCounter >= MAX_BATCH_SIZE) {
              await currentBatch.commit();
              currentBatch = writeBatch(db);
              batchCounter = 0;
              addLog(`... Đã lưu ${successCount} dòng...`);
            }
          } else {
            // Trường hợp user có data nhưng chưa từng đăng nhập hệ thống mới (chưa có UID trong collection users)
            // Ta sẽ KHÔNG xóa email để tránh mất dữ liệu chủ sở hữu
            skipCount++;
            console.warn(`Không tìm thấy UID cho email: ${data.email}`);
          }
        }
      };

      // Loop Vocab
      for (const d of vocabSnap.docs) {
        await processDoc(d.ref, d.data());
      }
      
      // Loop Topic
      for (const d of topicSnap.docs) {
        await processDoc(d.ref, d.data());
      }

      // Commit phần dư còn lại
      if (batchCounter > 0) {
        await currentBatch.commit();
      }

      addLog(`--- HOÀN THÀNH ---`);
      addLog(`✅ Thành công: ${successCount}`);
      addLog(`⚠️ Bỏ qua (do không tìm thấy UID user): ${skipCount}`);
      
      if (skipCount > 0) {
        alert(`Đã xong! Có ${skipCount} mục không thể migrate do User chưa đăng nhập vào hệ thống mới (không tìm thấy UID).`);
      } else {
        alert("Migrate và xóa email cũ thành công hoàn toàn!");
      }

    } catch (error) {
      console.error(error);
      addLog(`❌ LỖI: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow bg-gray-50 my-4 max-w-xl mx-auto">
      <h3 className="font-bold mb-2 text-red-600">⚠ Công cụ Migrate Final (Email -&gt; UID)</h3>
      <p className="text-sm text-slate-600 mb-4">
        Công cụ này sẽ tìm UID tương ứng với Email, cập nhật vào <b>userId</b> và <b>XÓA vĩnh viễn</b> field email trong Vocabulary/Topics.
      </p>
      <Button onClick={runMigration} disabled={loading} variant="destructive">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Đang xử lý..." : "Chạy Migrate & Xóa Email"}
      </Button>
      <div className="mt-4 bg-black text-white p-2 rounded text-xs h-40 overflow-y-auto font-mono">
        {log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
};