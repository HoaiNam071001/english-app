import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, db, googleProvider } from "@/firebaseConfig";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DataTable, UserProfile, UserRole, UserStatus } from "@/types";

// 1. Định nghĩa kiểu dữ liệu cho Context
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// 2. Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Tạo Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser && currentUser.email) {
        setUser(currentUser);
        try {
          // --- GIỮ NGUYÊN LOGIC DÙNG EMAIL THEO YÊU CẦU ---
          const userRef = doc(db, DataTable.USER, currentUser.email); 
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            // User cũ -> Get data
            const data = userSnap.data();
            
            // Update lastLogin
            await setDoc(userRef, { lastLoginAt: Date.now() }, { merge: true });
            
            // Gán lại ID (vẫn là email) vào profile
            setUserProfile({ ...data } as UserProfile);
          } else {
            // User mới -> Create data
            const newProfile: UserProfile = {
              id: currentUser.uid, 
              email: currentUser.email, // Dùng email làm ID hiển thị
              role: UserRole.USER,
              status: UserStatus.PENDING,
              createdAt: Date.now(),
              lastLoginAt: Date.now(),
            };
            
            // Lưu vào DB với ID là Email
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

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, googleProvider);
      // Không cần return user vì onAuthStateChanged sẽ tự bắt sự kiện
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Bạn đã đóng popup đăng nhập.');
      } else {
        setError('Đăng nhập thất bại.');
      }
    } finally {
      // Lưu ý: setLoading(false) sẽ được xử lý bởi onAuthStateChanged, 
      // nhưng ta vẫn set ở đây để handle trường hợp lỗi ngay lập tức.
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      setUser(null);
      // Reload trang để xóa sạch cache state nếu cần
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    loginWithGoogle,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Hook để sử dụng Context (Thay thế hook cũ)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};