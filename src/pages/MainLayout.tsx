import { useState, useRef, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Loader2, LogOut, Settings, Trash2 } from "lucide-react";
import { UserStatus } from "@/types";

import HomePage from "./home";
import EmailEntry from "@/components/Auth/EmailEntry";
import PendingScreen from "@/components/Auth/PendingScreen";
import { Button } from "@/components/ui/button";
import UsersPage from "@/pages/admin/UsersPage";
import { useAuth } from "@/hooks/useAuth";
import { GUEST_INFO, STORAGE_KEY } from "@/constants";

// --- Components phụ: Màn hình bị từ chối ---
const RejectedScreen = ({ onLogout }: { onLogout: () => void }) => (
  <div className="h-screen flex items-center justify-center flex-col gap-4">
    <h2 className="text-xl text-red-600 font-bold">
      Tài khoản bị từ chối truy cập
    </h2>
    <Button onClick={onLogout}>Đăng xuất</Button>
  </div>
);

// --- Component: User Menu (Nút Fixed góc phải) ---
const UserFloatingMenu = ({
  user,
  isGuest,
  onLogout,
  onGuestExit,
  onGuestClearData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside để đóng menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Không hiện nút nếu chưa login và không phải guest
  if (!user && !isGuest) return null;

  return (
    <div className="fixed top-4 right-4 z-9999" ref={menuRef}>
      {/* Nút tròn Avatar/Settings */}
      <Button
        variant="outline"
        size="icon"
        className="rounded-full shadow-md bg-white hover:bg-slate-100 border-slate-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="Avatar"
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <Settings className="h-5 w-5 text-slate-600" />
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-slate-100 p-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          {/* Header nhỏ */}
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user ? user.displayName : "Khách ghé thăm"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user ? user.email : "Chế độ Offline"}
            </p>
          </div>

          {/* User thật: Chỉ có nút Logout */}
          {user && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          )}

          {/* Guest: Có nút Thoát và Xóa dữ liệu */}
          {isGuest && (
            <>
              <button
                onClick={onGuestExit}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
              >
                <LogOut size={16} /> Thoát chế độ khách
              </button>

              <button
                onClick={onGuestClearData}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={16} /> Xóa dữ liệu & Thoát
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// --- MAIN LAYOUT ---
export const MainLayout = () => {
  const { user, userProfile, loading, isGuest, setIsGuest, logout } = useAuth();

  // 1. Vào chế độ Guest
  const handleGuestLogin = () => {
    localStorage.setItem(STORAGE_KEY.is_GUEST, "true");
    setIsGuest(true);
  };

  // 3. Guest: Xóa sạch dữ liệu (Reset app)
  const handleGuestClearData = () => {
    if (
      confirm(
        "Bạn có chắc muốn xóa toàn bộ dữ liệu (từ vựng, chủ đề) đã lưu trên máy này không?"
      )
    ) {
      localStorage.removeItem(STORAGE_KEY.is_GUEST);

      Object.values(GUEST_INFO.storageKey).forEach((key) => {
        localStorage.removeItem(key);
      });

      setIsGuest(false);
      window.location.reload();
    }
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

  // Logic chặn User Profile
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
      {/* --- NÚT FIXED MENU Ở ĐÂY --- */}
      <UserFloatingMenu
        user={user}
        isGuest={isGuest}
        onLogout={logout}
        onGuestExit={logout}
        onGuestClearData={handleGuestClearData}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
