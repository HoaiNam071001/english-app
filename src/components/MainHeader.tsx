import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import { Book, Globe, LucideIcon, NotebookPen, Shield } from "lucide-react";
import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserFloatingMenu } from "./UserFloatingMenu";

interface NavItem {
  key: string;
  label: string;
  shortLabel?: string;
  path: string;
  icon: LucideIcon;
  isActive: boolean;
  isVisible: boolean;
  variant: "default" | "admin";
}

export const MainHeader = () => {
  const location = useLocation();
  const { userProfile } = useAuth();

  const navItems: NavItem[] = useMemo(() => {
    const checkIsActive = (path: string) => {
      if (path === "/") return location.pathname === "/";
      return location.pathname.startsWith(path);
    };

    const adminUsersPath = `${ROUTES.ADMIN.ROOT}/${ROUTES.ADMIN.USERS}`;

    return [
      {
        key: "home",
        label: "My Vocabulary",
        shortLabel: "My Vocab",
        path: ROUTES.HOME,
        icon: Book,
        isActive:
          checkIsActive(ROUTES.HOME) &&
          location.pathname !== ROUTES.SHARED &&
          !location.pathname.startsWith(ROUTES.ADMIN.ROOT),
        isVisible: true,
        variant: "default",
      },
      {
        key: "note",
        label: "Note",
        path: ROUTES.NOTE,
        icon: NotebookPen,
        isActive: checkIsActive(ROUTES.NOTE),
        isVisible: true,
        variant: "default",
      },
      {
        key: "shared",
        label: "Community",
        path: ROUTES.SHARED,
        icon: Globe,
        isActive: checkIsActive(ROUTES.SHARED),
        isVisible: !!userProfile,
        variant: "default",
      },
      {
        key: "admin",
        label: "Admin",
        path: adminUsersPath,
        icon: Shield,
        isActive: checkIsActive(ROUTES.ADMIN.ROOT),
        isVisible: userProfile?.role === UserRole.ADMIN,
        variant: "admin",
      },
    ];
  }, [location.pathname, userProfile?.role]); // Dependency array giờ đã chính xác

  const getNavItemClasses = (
    isActive: boolean,
    variant: "default" | "admin"
  ) => {
    const baseClasses =
      "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all";

    if (!isActive) {
      if (variant === "admin") {
        return `${baseClasses} text-muted-foreground hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:text-purple-600`;
      }
      return `${baseClasses} text-muted-foreground hover:bg-muted hover:text-foreground`;
    }

    if (variant === "admin") {
      return `${baseClasses} bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300`;
    }
    return `${baseClasses} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto max-w-8xl px-4">
        <div className="mr-4 hidden md:flex">
          <Link to={ROUTES.HOME} className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              VocabManager
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-1 mx-auto md:mx-0">
          {navItems.map((item) => {
            if (!item.isVisible) return null;

            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                to={item.path}
                className={getNavItemClasses(item.isActive, item.variant)}
              >
                <Icon size={16} />
                {item.shortLabel ? (
                  <>
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sm:hidden">{item.shortLabel}</span>
                  </>
                ) : (
                  <span>{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <UserFloatingMenu />
        </div>
      </div>
    </header>
  );
};
