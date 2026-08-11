import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "Tính năng", href: "#features" },
  { label: "Cộng đồng", href: "#community" },
  { label: "Đa nền tảng", href: "#mobile" },
];

export const LandingHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { userProfile, isGuest } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isAuthed = !!userProfile || isGuest;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <a href="#top" className="flex items-center gap-2">
          <img src="/logo.svg" alt="English Master" className="h-7 w-7" />
          <span className="text-base font-bold text-foreground md:text-lg">
            English Master
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Bật chế độ tối" : "Bật chế độ sáng"}
            title={theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </Button>
          <Button
            onClick={() => navigate(isAuthed ? ROUTES.HOME : ROUTES.LOGIN)}
            className="gap-1.5 bg-gradient-to-r from-brand-start via-brand-mid to-brand-end text-primary-foreground hover:from-brand-hover-start hover:to-brand-hover-end"
          >
            {isAuthed ? "Vào ứng dụng" : "Bắt đầu miễn phí"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-md text-foreground md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-md px-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
            </button>
            <Button
              onClick={() => {
                setMobileOpen(false);
                navigate(isAuthed ? ROUTES.HOME : ROUTES.LOGIN);
              }}
              className="mt-2 w-full gap-1.5 bg-gradient-to-r from-brand-start via-brand-mid to-brand-end text-primary-foreground"
            >
              {isAuthed ? "Vào ứng dụng" : "Bắt đầu miễn phí"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};
