import { auth, db } from "@/firebaseConfig";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DataTable, UserProfile, UserRole, UserStatus } from "@/types";

// Import các màn hình
import EmailEntry from "@/components/EmailEntry";
import PendingScreen from "@/components/PendingScreen";
import { TopicProvider } from "@/contexts/TopicContext";
import AdminUserManagement from "@/components/AdminUserManagement";
import { Button } from "@/components/ui/button";
import { DashboardContent } from "./DashboardContent";
import { MigrationTool } from "@/migrations/MigrationTool";

const HomePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        // --- LOGIC CHECK QUYỀN ---
        try {
          // Lưu ý: Bạn đang dùng email làm Document ID
          const userRef = doc(db, DataTable.USER, currentUser.email!);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            // 1. User đã tồn tại -> Lấy data và gán thêm ID
            const data = userSnap.data();

            // Ép kiểu và thêm field id (lấy từ userSnap.id hoặc currentUser.email)
            const profile = {
              ...data,
            } as UserProfile;

            // Cập nhật lastLogin
            setDoc(userRef, { lastLoginAt: Date.now() }, { merge: true });

            setUserProfile(profile);
          } else {
            // 2. User mới -> Tạo profile mặc định kèm ID
            const newProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email!,
              role: UserRole.USER,
              status: UserStatus.PENDING,
              createdAt: Date.now(),
              lastLoginAt: Date.now(),
            };

            // Lưu vào DB
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error("Lỗi check profile:", error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // ... (Phần render UI bên dưới giữ nguyên) ...

  // 1. Chưa login
  if (!user || !userProfile) {
    return <EmailEntry onSubmit={() => {}} />;
  }

  // 2. REJECTED
  if (userProfile.status === UserStatus.REJECTED) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-xl text-red-600 font-bold">
          Tài khoản bị từ chối truy cập
        </h2>
        <Button onClick={handleLogout}>Đăng xuất</Button>
      </div>
    );
  }

  // 3. PENDING
  if (userProfile.status === UserStatus.PENDING) {
    return <PendingScreen email={user.email!} onLogout={handleLogout} />;
  }

  // 4. APPROVED
  return (
    <TopicProvider userId={userProfile.id!}>
      <div className="relative">
        {/* <MigrationTool/> */}
        <DashboardContent user={userProfile} onLogout={handleLogout} />

        {userProfile.role === UserRole.ADMIN && (
          <div className="fixed bottom-4 left-4 z-50">
            <AdminUserManagement currentAdminId={userProfile.id!} />
          </div>
        )}
      </div>
    </TopicProvider>
  );
};

export default HomePage;
