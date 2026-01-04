import { db } from "@/firebaseConfig";
import { DataTable, UserProfile, UserRole, UserStatus } from "@/types";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore"; // Bỏ 'where'
import { useCallback, useEffect, useState } from "react";
import { useConfirm } from "./useConfirm";

export const useAdmin = (userProfile: UserProfile) => {
  // Đổi tên state từ pendingUsers -> allUsers
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { confirm } = useConfirm();

  // Fetch ALL users (Bỏ where status == PENDING)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, DataTable.USER),
        orderBy("createdAt", "desc") // Lấy tất cả, sắp xếp mới nhất lên đầu
      );
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map((doc) => ({
        ...doc.data(),
      })) as UserProfile[];
      setAllUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userProfile) fetchUsers();
  }, [userProfile, fetchUsers]);

  const approveUser = async (id: string) => {
    try {
      const docRef = doc(db, DataTable.USER, id);
      const value = {
        status: UserStatus.APPROVED,
        role: UserRole.USER,
        approvedBy: userProfile.email,
        approvedAt: Date.now(),
      };
      await updateDoc(docRef, value);
      // Cập nhật UI local: Tìm user đó và đổi status thành APPROVED
      setAllUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...value } : u))
      );
    } catch (error) {
      console.error("Error approving:", error);
    }
  };

  const rejectUser = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Reject User?",
      message: "Are you sure you want to reject this user?",
      confirmText: "Reject",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!isConfirmed) return;

    try {
      const docRef = doc(db, DataTable.USER, id);
      const value = {
        status: UserStatus.REJECTED,
        approvedBy: userProfile.email,
        approvedAt: Date.now(),
      };
      await updateDoc(docRef, value);
      setAllUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...value } : u))
      );
    } catch (error) {
      console.error("Error rejecting:", error);
    }
  };

  return {
    allUsers, // Trả về danh sách đầy đủ
    loading,
    approveUser,
    rejectUser,
  };
};
