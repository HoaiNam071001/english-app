import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GUEST_INFO, STORAGE_KEY } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { ArrowLeftCircle, LogOut, Trash2, Users } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserAvatar } from "./UserAvatar";

export const UserFloatingMenu = () => {
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

  if (!user && !isGuest) return null;

  const headerName = isGuest ? "Guest User" : user?.displayName || "User";
  const headerEmail = isGuest ? "Local Session" : user?.email || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer">
          <UserAvatar
            email={user?.email}
            isGuest={isGuest}
            photoUrl={isGuest ? null : user.photoURL}
          />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72" align="end" forceMount>
        {/* HEADER SECTION */}
        <div
          className={`px-2 py-1.5 ${
            isGuest ? "bg-orange-50/50 dark:bg-orange-900/10 rounded-t-sm" : ""
          }`}
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-bold leading-none truncate">
                {headerName}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {headerEmail}
              </p>
              {isGuest && (
                <span className="w-fit text-[10px] font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded mt-1 inline-block">
                  GUEST MODE
                </span>
              )}
            </div>
          </DropdownMenuLabel>
        </div>

        <DropdownMenuSeparator />

        {/* THEME TOGGLE */}
        <div className="px-2 py-1.5">
          <ThemeToggle text="Theme" />
        </div>

        <DropdownMenuSeparator />

        {/* SWITCH BACK TO USER (FOR GUEST) */}
        {isGuest && user && (
          <>
            <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-semibold px-2 py-1">
              Switch back to
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="p-2 cursor-pointer focus:bg-accent"
              onClick={() => {
                logout();
                loginWithGoogle(user.email);
              }}
            >
              <div className="flex items-center gap-3 w-full">
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
                  <span className="text-sm font-medium truncate">
                    {user.displayName}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* GUEST ACTIONS */}
        {isGuest && (
          <>
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-popover-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Exit Guest Mode</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onGuestClearData}
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Clear Data & Exit</span>
            </DropdownMenuItem>
          </>
        )}

        {/* USER ACTIONS */}
        {!isGuest && user && (
          <>
            <DropdownMenuItem
              onClick={() => (switchAccount ? switchAccount() : logout())}
              className="cursor-pointer"
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Switch Account</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
