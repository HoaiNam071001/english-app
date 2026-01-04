import { db } from "@/firebaseConfig"; // Đường dẫn config của bạn
import { DataTable, UserProfile } from "@/types"; // Import type cũ của bạn
import console from "console";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { AlertTriangle, Check, Copy, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface MigrationUser extends UserProfile {
  docId: string; // ID hiện tại của document (có thể là email hoặc uid)
  isMigrated: boolean; // Flag để biết đã đúng chuẩn chưa
}

export const UserMigrationTool = () => {
  const [users, setUsers] = useState<MigrationUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 1. Load danh sách User từ Firestore
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, DataTable.USER));
      const list: MigrationUser[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        // Kiểm tra logic: Nếu docId chứa ký tự '@', khả năng cao đó là key cũ
        // Nếu docId trùng với data.id (uid), thì là đã chuẩn
        const currentDocId = docSnap.id;
        const isEmailKey = currentDocId.includes("@");
        const isUidKey = currentDocId === data.id;

        list.push({
          ...data,
          docId: currentDocId,
          isMigrated: isUidKey && !isEmailKey,
        });
      });

      setUsers(list);
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
      alert("Lỗi lấy danh sách user. Check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Hàm Migrate: Clone data từ Key cũ sang Key mới (UID)
  const handleMigrate = async (user: MigrationUser) => {
    if (!user.id) {
      alert(
        "User này không có field 'id' (UID) trong data. Không thể migrate."
      );
      return;
    }

    if (user.docId === user.id) {
      alert("User này đã dùng UID làm key rồi.");
      return;
    }

    setProcessingId(user.docId);
    try {
      // B1: Tạo bản ghi mới với Key là UID
      const newRef = doc(db, DataTable.USER, user.emailId);
      const newData = { ...user };

      await setDoc(newRef, newData, { merge: true });

      alert(`Đã clone thành công user ${user.email} sang key ${user.emailId}`);
      await fetchUsers(); // Reload lại list
    } catch (error) {
      console.error("Lỗi migration:", error);
      alert("Có lỗi xảy ra khi migrate.");
    } finally {
      setProcessingId(null);
    }
  };

  // 3. Hàm Xóa bản ghi cũ (Sau khi đã migrate thành công)
  const handleDeleteOld = async (docId: string) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa bản ghi cũ (Key: ${docId})?`))
      return;

    setProcessingId(docId);
    try {
      await deleteDoc(doc(db, DataTable.USER, docId));
      await fetchUsers();
    } catch (error) {
      console.error("Lỗi xóa:", error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User DB Migration Tool</h1>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Loader2 className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Reload List
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-zinc-900">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-zinc-800 uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3">Email (Display)</th>
              <th className="px-4 py-3">Current Doc Key</th>
              <th className="px-4 py-3">Target UID (Inside Data)</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {users.map((u) => (
              <tr
                key={u.docId}
                className="hover:bg-gray-50 dark:hover:bg-zinc-800/50"
              >
                <td className="px-4 py-3 font-medium">{u.email}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {u.docId}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-blue-500">
                  {u.id || "MISSING UID"}
                </td>
                <td className="px-4 py-3 text-center">
                  {u.isMigrated ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" /> OK
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Old Key
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {!u.isMigrated && (
                    <button
                      onClick={() => handleMigrate(u)}
                      disabled={!!processingId}
                      className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {processingId === u.docId ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Copy className="w-3 h-3 mr-1" />
                      )}
                      Clone to UID
                    </button>
                  )}

                  {/* Chỉ hiện nút xóa nếu đây là Key dạng Email VÀ ta biết chắc chắn UID key đã tồn tại (dựa vào check list) */}
                  {!u.isMigrated &&
                    users.some((existing) => existing.docId === u.id) && (
                      <button
                        onClick={() => handleDeleteOld(u.docId)}
                        disabled={!!processingId}
                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Del Old
                      </button>
                    )}

                  {/* Trường hợp nút xóa thủ công cho user cũ sau khi clone */}
                  {!u.isMigrated &&
                    !users.some((existing) => existing.docId === u.id) && (
                      <span className="text-xs text-gray-400 italic mr-2">
                        Clone first
                      </span>
                    )}
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No users found in Firestore.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
