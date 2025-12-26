import { LogOut, Settings, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

// --- Component: User Menu (Nút Fixed góc phải) ---
export const UserFloatingMenu = ({
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
    <div className="fixed top-4 right-8 z-9999" ref={menuRef}>
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
