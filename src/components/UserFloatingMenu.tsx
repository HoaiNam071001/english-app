import { User } from "firebase/auth"; // Import type User nếu cần
import { LogOut, Settings, Trash2, Users } from "lucide-react"; // 1. Import icon Users
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

interface UserFloatingMenuProps {
  user: User | null;
  isGuest: boolean;
  onLogout: () => void;
  onGuestExit: () => void;
  onGuestClearData: () => void;
  onSwitchAccount?: () => void; // 2. Thêm prop này
}

export const UserFloatingMenu = ({
  user,
  isGuest,
  onLogout,
  onGuestExit,
  onGuestClearData,
  onSwitchAccount, // 3. Nhận prop
}: UserFloatingMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user && !isGuest) return null;

  return (
    <div className="fixed top-4 right-8 z-[9999]" ref={menuRef}>
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
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <Settings className="h-5 w-5 text-foreground" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-popover rounded-md shadow-lg border border-border p-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          {/* Header */}
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-sm font-medium text-popover-foreground truncate">
              {user ? user.displayName : "Guest User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user ? user.email : "Local Session"}
            </p>
          </div>

          {/* Theme */}
          <div className="px-3 py-2 border-b border-border mb-1">
            <div className="flex items-center justify-between">
              <ThemeToggle text="Theme" />
            </div>
          </div>

          {/* MENU ACTIONS */}
          <div className="py-1">
            {user && (
              <>
                {/* 4. Nút Switch Account */}
                <button
                  onClick={() => {
                    if (onSwitchAccount) onSwitchAccount();
                    else onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-accent rounded-md transition-colors"
                >
                  <Users size={16} /> Switch Account
                </button>

                {/* Nút Logout */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 rounded-md transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            )}

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
        </div>
      )}
    </div>
  );
};
