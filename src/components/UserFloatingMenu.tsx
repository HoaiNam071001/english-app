import { LogOut, Settings, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";

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
        className="rounded-full shadow-md bg-background hover:bg-accent border-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="Avatar"
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <Settings className="h-5 w-5 text-foreground" />
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-popover rounded-md shadow-lg border border-border p-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          {/* Header nhỏ */}
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-sm font-medium text-popover-foreground truncate">
              {user ? user.displayName : "Guest User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user ? user.email : "Offline Mode"}
            </p>
          </div>

          {/* Theme Toggle */}
          <div className="px-3 py-2 border-b border-border mb-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-popover-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </div>

          {/* User thật: Chỉ có nút Logout */}
          {user && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 rounded-md transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          )}

          {/* Guest: Có nút Thoát và Xóa dữ liệu */}
          {isGuest && (
            <>
              <button
                onClick={onGuestExit}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-accent rounded-md transition-colors"
              >
                <LogOut size={16} /> Exit Guest Mode
              </button>

              <button
                onClick={onGuestClearData}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 rounded-md transition-colors"
              >
                <Trash2 size={16} /> Clear Data & Exit
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
