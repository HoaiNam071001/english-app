import React, { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { DataTable, UserProfile, UserRole, UserStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, X, ShieldAlert } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// 1. Đổi tên prop nhận vào ID
interface AdminUserManagementProps {
  currentAdminId: string; // <--- SỬ DỤNG ID
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  currentAdminId,
}) => {
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, DataTable.USER),
        where("status", "==", UserStatus.PENDING),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as UserProfile[];

      setPendingUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (targetUser: UserProfile) => {
    try {
      // Lưu ý: targetUser.id chính là UID của người được duyệt
      const docRef = doc(db, DataTable.USER, targetUser.id!);

      await updateDoc(docRef, {
        status: UserStatus.APPROVED,
        role: UserRole.USER,
        approvedBy: currentAdminId, // <--- LƯU UID ADMIN
        approvedAt: Date.now(),
      });

      setPendingUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
    } catch (error) {
      console.error("Error approving:", error);
    }
  };

  const handleReject = async (targetUser: UserProfile) => {
    if (!confirm("Từ chối user này?")) return;
    try {
      const docRef = doc(db, DataTable.USER, targetUser.id!);

      await updateDoc(docRef, {
        status: UserStatus.REJECTED,
        approvedBy: currentAdminId, // <--- LƯU UID ADMIN
        approvedAt: Date.now(),
      });

      setPendingUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
    } catch (error) {
      console.error("Error rejecting:", error);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
        >
          <ShieldAlert size={16} />
          Duyệt User{" "}
          {pendingUsers.length > 0 && (
            <div className="ml-1 px-1 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center min-w-[20px]">
              {pendingUsers.length}
            </div>
          )}
        </Button>
      </DialogTrigger>
      {/* Phần UI DialogContent giữ nguyên như cũ */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Danh sách chờ duyệt</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          {loading ? (
            <div className="text-center py-4 text-sm text-slate-500">
              Đang tải...
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Không có yêu cầu nào mới.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-slate-50"
                >
                  <div className="overflow-hidden">
                    <p
                      className="font-medium text-sm truncate"
                      title={user.email}
                    >
                      {user.email}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-600 hover:bg-green-100"
                      onClick={() => handleApprove(user)}
                    >
                      <Check size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-600 hover:bg-red-100"
                      onClick={() => handleReject(user)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserManagement;
