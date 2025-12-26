import { useState } from "react";
import { db } from "@/firebaseConfig";
import { 
  collection, getDocs, doc, getDoc, setDoc, writeBatch, serverTimestamp 
} from "firebase/firestore";
import { DataTable, UserProfile, UserRole, UserStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const MigrationTool = () => {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  const runMigration = async () => {
    if (!confirm("Bạn có chắc chắn muốn chạy migrate dữ liệu không?")) return;
    
    setLoading(true);
    setLog([]);
    addLog("--- BẮT ĐẦU MIGRATE ---");

    try {
      const batch = writeBatch(db);
      let operationCount = 0;
      const MAX_BATCH_SIZE = 450; // Giới hạn an toàn của Firestore (max 500)

      // 1. Lấy dữ liệu Vocabulary và Topics cũ
      const vocabSnap = await getDocs(collection(db, DataTable.Vocabulary));
      const topicSnap = await getDocs(collection(db, DataTable.Topics));
      
      addLog(`Tìm thấy ${vocabSnap.size} từ vựng và ${topicSnap.size} chủ đề.`);

      // 2. Thu thập danh sách Email duy nhất (để tạo User)
      const uniqueEmails = new Set<string>();
      
      vocabSnap.docs.forEach(d => {
        const data = d.data();
        if (data.email) uniqueEmails.add(data.email);
      });
      topicSnap.docs.forEach(d => {
        const data = d.data();
        if (data.email) uniqueEmails.add(data.email);
      });

      addLog(`Tìm thấy ${uniqueEmails.size} unique emails cần kiểm tra User Profile.`);

      // 3. Kiểm tra và Tạo User nếu chưa có
      for (const email of uniqueEmails) {
        // Vì ID của user chính là email
        const userRef = doc(db, DataTable.USER, email);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Tạo user mới
          const newUser: UserProfile = {
            id: email,
            email: email,
            role: UserRole.USER,
            status: UserStatus.APPROVED, // Set luôn Approved để họ không bị lock
            createdAt: Date.now(),
            lastLoginAt: Date.now(),
          };
          
          // Dùng setDoc trực tiếp (không qua batch để đảm bảo user có trước)
          await setDoc(userRef, newUser);
          addLog(`✅ Đã tạo user mới cho: ${email}`);
        }
      }

      // 4. Update Vocabulary (Thêm userId, giữ lại email để backup nếu muốn)
      let currentBatch = writeBatch(db);
      let count = 0;

      const processUpdate = async (docRef: any, data: any) => {
        // Logic: userId sẽ bằng email
        if (data.email && !data.userId) {
          currentBatch.update(docRef, { userId: data.email });
          count++;
          
          // Commit nếu đầy batch
          if (count >= MAX_BATCH_SIZE) {
            await currentBatch.commit();
            currentBatch = writeBatch(db);
            count = 0;
            addLog(`... Đã commit 1 batch update...`);
          }
        }
      };

      // Loop Vocab
      for (const d of vocabSnap.docs) {
        await processUpdate(d.ref, d.data());
      }
      
      // Loop Topic
      for (const d of topicSnap.docs) {
        await processUpdate(d.ref, d.data());
      }

      // Commit phần dư còn lại
      if (count > 0) {
        await currentBatch.commit();
      }

      addLog("--- HOÀN THÀNH MIGRATE ---");
      alert("Migrate thành công!");

    } catch (error) {
      console.error(error);
      addLog(`❌ LỖI: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow bg-gray-50 my-4">
      <h3 className="font-bold mb-2">Công cụ Migrate Data (Email -&gt; UserId)</h3>
      <Button onClick={runMigration} disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Chạy Migrate ngay
      </Button>
      <div className="mt-4 bg-black text-white p-2 rounded text-xs h-40 overflow-y-auto font-mono">
        {log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
};