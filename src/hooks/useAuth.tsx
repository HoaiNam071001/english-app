import { useEffect, useState } from "react";
import { auth, db, googleProvider } from "@/firebaseConfig";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { DataTable, UserProfile, UserRole, UserStatus } from "@/types";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Lắng nghe trạng thái Auth & Sync Firestore Profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          // Dùng email làm ID
          const userRef = doc(db, DataTable.USER, currentUser.email);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            // User cũ -> Get data
            const data = userSnap.data();
            setUserProfile({ ...data } as UserProfile);
            console.log(data)
            // Update lastLogin
            await setDoc(userRef, { lastLoginAt: Date.now() }, { merge: true });
          } else {
            // User mới -> Create data
            const newProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email!,
              role: UserRole.USER,
              status: UserStatus.PENDING,
              createdAt: Date.now(),
              lastLoginAt: Date.now(),
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error("Lỗi sync profile:", err);
          setError("Lỗi đồng bộ thông tin người dùng.");
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Hàm Login Google
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Bạn đã đóng popup đăng nhập.');
      } else {
        setError('Đăng nhập thất bại.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 3. Hàm Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return {
    user,
    userProfile,
    loading,
    error,
    loginWithGoogle,
    logout
  };
};