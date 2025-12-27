import { GUEST_INFO, STORAGE_KEY } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import {
  ArrowLeftCircle,
  LogOut,
  Settings,
  Trash2,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

export const UserFloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isGuest, user, loginWithGoogle, setIsGuest, switchAccount, logout } =
    useAuth();

  const toast = useToast();
  const { confirm } = useConfirm();

  const onGuestClearData = async () => {
    const isConfirmed = await confirm({
      title: "Clear Data?",
      message:
        "Are you sure you want to delete all data (vocabulary, topics) saved on this device? This action cannot be undone.",
      confirmText: "Clear Now",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (isConfirmed) {
      localStorage.removeItem(STORAGE_KEY.IS_GUEST);

      Object.values(GUEST_INFO.storageKey).forEach((key) => {
        localStorage.removeItem(key);
      });

      setIsGuest(false);
      toast.success("Data cleared successfully!");
    }
  };

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

  const headerName = isGuest ? "Guest User" : user?.displayName || "User";
  const headerEmail = isGuest ? "Local Session" : user?.email || "";

  return (
    <div className="fixed top-4 right-8 z-[9999]" ref={menuRef}>
      <Button
        variant="outline"
        size="icon"
        className={`rounded-full shadow-md border-border transition-all ${
          isGuest
            ? "bg-orange-100 hover:bg-orange-200 border-orange-300 dark:bg-orange-900/20"
            : "bg-background hover:bg-accent"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isGuest ? (
          <UserIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        ) : user?.photoURL ? (
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
        <div className="absolute right-0 mt-2 w-72 bg-popover rounded-md shadow-lg border border-border p-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          {/* Header */}
          <div
            className={`px-3 py-3 border-b border-border mb-1 ${
              isGuest
                ? "bg-orange-50/50 dark:bg-orange-900/10 rounded-t-md"
                : ""
            }`}
          >
            <p className="text-sm font-bold text-popover-foreground truncate">
              {headerName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {headerEmail}
            </p>
            {isGuest && (
              <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded mt-1 inline-block">
                GUEST MODE
              </span>
            )}
          </div>

          {/* Theme */}
          <div className="px-3 py-2 border-b border-border mb-1">
            <div className="flex items-center justify-between">
              <ThemeToggle text="Theme" />
            </div>
          </div>

          <div className="py-1 flex flex-col gap-1">
            {/* Nếu là Guest mà có User cũ -> Hiện thêm thẻ User cũ để switch nhanh */}
            {isGuest && user && (
              <div className="px-2 pb-2 border-b border-border mb-1">
                <p className="text-[10px] uppercase text-muted-foreground font-semibold px-2 mb-1 mt-1">
                  Switch back to
                </p>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                    loginWithGoogle(user.email);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 bg-accent/50 hover:bg-accent rounded-md transition-all group text-left"
                >
                  <div className="relative">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        className="w-8 h-8 rounded-full border border-border"
                        alt="User"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold">
                          {user.displayName?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-[2px] border border-popover">
                      <ArrowLeftCircle size={10} className="text-white" />
                    </div>
                  </div>

                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                      {user.displayName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* --- ACTION MENU CHO GUEST --- */}
            {isGuest && (
              <>
                {/* 1. Nút Thoát Guest (giữ data) - Đã hiển thị lại vô điều kiện */}
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-accent rounded-md transition-colors"
                >
                  <LogOut size={16} /> Exit Guest Mode
                </button>

                {/* 2. Nút Xoá Data & Thoát */}
                <button
                  onClick={() => {
                    onGuestClearData();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 rounded-md transition-colors"
                >
                  <Trash2 size={16} /> Clear Data & Exit
                </button>
              </>
            )}

            {/* --- ACTION MENU CHO USER --- */}
            {!isGuest && user && (
              <>
                <button
                  onClick={() => {
                    if (switchAccount) switchAccount();
                    else logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-accent rounded-md transition-colors"
                >
                  <Users size={16} /> Switch Account
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 rounded-md transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
