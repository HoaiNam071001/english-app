import { useState, useEffect, useCallback } from "react";
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

export const useAdmin = (currentAdminId: string) => {
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch users
  const fetchPendingUsers = useCallback(async () => {
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
  }, []);

  // Auto fetch khi mount hook
  useEffect(() => {
    if (currentAdminId) fetchPendingUsers();
  }, [currentAdminId, fetchPendingUsers]);

  // Approve User
  const approveUser = async (targetUserId: string) => {
    try {
      const docRef = doc(db, DataTable.USER, targetUserId);
      await updateDoc(docRef, {
        status: UserStatus.APPROVED,
        role: UserRole.USER,
        approvedBy: currentAdminId,
        approvedAt: Date.now(),
      });
      // Cập nhật UI ngay lập tức
      setPendingUsers((prev) => prev.filter((u) => u.id !== targetUserId));
    } catch (error) {
      console.error("Error approving:", error);
    }
  };

  // Reject User
  const rejectUser = async (targetUserId: string) => {
    if (!confirm("Từ chối user này?")) return;
    try {
      const docRef = doc(db, DataTable.USER, targetUserId);
      await updateDoc(docRef, {
        status: UserStatus.REJECTED,
        approvedBy: currentAdminId,
        approvedAt: Date.now(),
      });
      setPendingUsers((prev) => prev.filter((u) => u.id !== targetUserId));
    } catch (error) {
      console.error("Error rejecting:", error);
    }
  };

  return {
    pendingUsers,
    loading,
    fetchPendingUsers,
    approveUser,
    rejectUser,
  };
};
