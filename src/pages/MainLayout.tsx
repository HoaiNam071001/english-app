import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react"; // Import thêm icon LogOut
import { UserStatus } from "@/types";

import HomePage from "./home";
import EmailEntry from "@/components/Auth/EmailEntry";
import PendingScreen from "@/components/Auth/PendingScreen";
import { Button } from "@/components/ui/button";
import UsersPage from "@/pages/admin/UsersPage";
import { useAuth } from "@/hooks/useAuth";
import { STORAGE_KEY } from "@/constants";

const RejectedScreen = ({ onLogout }: { onLogout: () => void }) => (
  <div className="h-screen flex items-center justify-center flex-col gap-4">
    <h2 className="text-xl text-red-600 font-bold">
      Tài khoản bị từ chối truy cập
    </h2>
    <Button onClick={onLogout}>Đăng xuất</Button>
  </div>
);

export const MainLayout = () => {
  const { user, userProfile, loading, isGuest, setIsGuest, logout } = useAuth();

  // 2. Hàm Login Guest: Lưu vào storage + set state
  const handleGuestLogin = () => {
    localStorage.setItem(STORAGE_KEY.is_GUEST, "true");
    setIsGuest(true);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Logic hiển thị EmailEntry:
  if (!user && !isGuest) {
    return <EmailEntry onGuestLogin={handleGuestLogin} />;
  }

  // Logic chặn User Profile (Chỉ áp dụng nếu là USER THẬT)
  if (user && userProfile) {
    if (userProfile.status === UserStatus.PENDING) {
      return <PendingScreen email={user.email!} onLogout={logout} />;
    }
    if (userProfile.status === UserStatus.REJECTED) {
      return <RejectedScreen onLogout={logout} />;
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Chỉ Admin thật mới vào được trang Admin */}
        <Route path="/admin/users" element={<UsersPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
