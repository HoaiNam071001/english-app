/* eslint-disable react-refresh/only-export-components */
import { STORAGE_KEY } from "@/constants";
import { auth, db, googleProvider } from "@/firebaseConfig";
import {
  DataTable,
  SavedAccount,
  UserProfile,
  UserRole,
  UserStatus,
} from "@/types";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, ReactNode, useEffect, useState } from "react";

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isGuest: boolean;
  loginWithGoogle: (emailHint?: string) => Promise<void>;
  logout: () => Promise<void>; // Logout thật (xóa session)
  switchAccount: () => void; // Logout mềm (giữ session để login lại nhanh)
  setIsGuest: (isGuest: boolean) => void;
  removeSavedAccount: (email: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem?.(STORAGE_KEY.IS_GUEST) === "true";
  });

  // --- LOGIC LƯU ACCOUNT LOCAL ---
  const saveAccountToStorage = (currentUser: User) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY.SAVED_ACCOUNTS);
      let accounts: SavedAccount[] = stored ? JSON.parse(stored) : [];
      accounts = accounts.filter((acc) => acc.email !== currentUser.email);
      accounts.unshift({
        uid: currentUser.uid,
        email: currentUser.email || "",
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        lastLogin: Date.now(),
      });
      if (accounts.length > 5) accounts.pop();
      localStorage.setItem(
        STORAGE_KEY.SAVED_ACCOUNTS,
        JSON.stringify(accounts)
      );
    } catch (e) {
      console.error("Failed to save account", e);
    }
  };

  const removeSavedAccount = (email: string) => {
    const stored = localStorage.getItem(STORAGE_KEY.SAVED_ACCOUNTS);
    if (stored) {
      let accounts: SavedAccount[] = JSON.parse(stored);
      accounts = accounts.filter((acc) => acc.email !== email);
      localStorage.setItem(
        STORAGE_KEY.SAVED_ACCOUNTS,
        JSON.stringify(accounts)
      );
    }
  };

  // --- HÀM ĐỒNG BỘ FIRESTORE (Tách ra để tái sử dụng) ---
  const syncUserToFirestore = async (currentUser: User) => {
    const userRef = doc(db, DataTable.USER, currentUser.email!);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      setUserProfile({ ...data } as UserProfile);
      await setDoc(
        userRef,
        { lastLoginAt: Date.now(), photoURL: currentUser.photoURL },
        { merge: true }
      );
    } else {
      const newProfile: UserProfile = {
        id: currentUser.uid,
        email: currentUser.email,
        role: UserRole.USER,
        status: UserStatus.PENDING,
        photoURL: currentUser.photoURL,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      };
      await setDoc(userRef, newProfile);
      setUserProfile(newProfile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Chỉ chạy loading nếu thực sự có sự thay đổi auth từ Firebase
      // Nếu switchAccount (soft logout) thì không trigger cái này
      setLoading(true);
      if (currentUser && currentUser.email) {
        setUser(currentUser);
        saveAccountToStorage(currentUser);

        try {
          if (!isGuest) {
            await syncUserToFirestore(currentUser);
          }
        } catch (err) {
          console.error("Sync error:", err);
          setError("Lỗi đồng bộ thông tin.");
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- LOGIN THÔNG MINH ---
  const loginWithGoogle = async (emailHint?: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Kiểm tra xem có phải đang Login lại chính User hiện tại không?
      // (Trường hợp vừa bấm Switch Account xong bấm lại chính nick đó)
      if (auth.currentUser?.email && emailHint === auth.currentUser.email) {
        // User vẫn đang logged in ở Firebase, chỉ cần load lại Profile
        await syncUserToFirestore(auth.currentUser);
        setLoading(false);
        return; // Xong, không cần hiện popup
      }

      // 2. Nếu chọn nick khác -> Phải SignOut nick cũ trước
      if (auth.currentUser) {
        await signOut(auth);
      }

      // 3. Quy trình Popup bình thường
      if (emailHint) {
        googleProvider.setCustomParameters({ login_hint: emailHint }); // Bỏ prompt select_account để auto login nếu được
      } else {
        googleProvider.setCustomParameters({ prompt: "select_account" });
      }

      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged sẽ lo phần còn lại
    } catch (err) {
      console.error("Login failed:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Đã đóng cửa sổ đăng nhập.");
      } else {
        setError("Đăng nhập thất bại.");
      }
      setLoading(false);
    }
  };

  // --- LOGOUT CỨNG (Xóa session) ---
  const logout = async () => {
    try {
      if (isGuest) {
        setIsGuest(false);
        localStorage.removeItem(STORAGE_KEY.IS_GUEST);
        return;
      }
      await signOut(auth); // Xóa session Firebase
      setUserProfile(null);
      setUser(null);
      // window.location.reload(); // Không cần reload, React state sẽ tự update UI
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // --- LOGOUT MỀM (Chuyển tài khoản) ---
  const switchAccount = () => {
    // Chỉ set Profile = null để App đá về trang Login
    // Session Firebase vẫn giữ nguyên
    setUserProfile(null);
  };

  // --- HEARTBEAT: Cập nhật lastLoginAt mỗi 1 phút ---
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Chỉ thiết lập interval khi có user, không phải guest và có email
    if (user && user.email) {
      intervalId = setInterval(async () => {
        try {
          const userRef = doc(db, DataTable.USER, user.email);
          await setDoc(userRef, { lastLoginAt: Date.now() }, { merge: true });
        } catch (err) {
          console.error("Heartbeat failed:", err);
        }
      }, 60000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user]);

  const value = {
    user,
    userProfile,
    loading,
    error,
    isGuest,
    setIsGuest,
    loginWithGoogle,
    logout,
    switchAccount,
    removeSavedAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
