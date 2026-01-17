import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import {
  Book,
  Globe,
  LucideIcon,
  Menu,
  NotebookPen,
  Shield,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    variant: "default" | "admin",
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

  const handleMobileNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto max-w-8xl px-3 md:px-4">
        {/* Logo - Mobile: Visible, Desktop: Visible */}
        <div className="flex items-center mr-2">
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <img className="w-6 dark:hidden" src={"/logo.svg"} />
            <img className="w-6 hidden dark:inline" src={"/logo-dark.svg"} />
            <span className="font-bold text-base md:text-lg bg-clip-text text-transparent bg-blue-600">
              English Master
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 mx-auto md:mx-0">
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

        {/* Mobile Navigation Menu */}
        <div className="flex md:hidden items-center gap-2">
          <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu size={20} />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navItems
                .filter((item) => item.isVisible)
                .map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key}>
                      {index > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={() => handleMobileNavClick(item.path)}
                        className={`flex items-center gap-2 cursor-pointer ${
                          item.isActive
                            ? item.variant === "admin"
                              ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                              : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : ""
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    </div>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <UserFloatingMenu />
        </div>

        {/* Desktop User Menu */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-2">
          <UserFloatingMenu />
        </div>
      </div>
    </header>
  );
};
