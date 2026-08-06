import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { ArrowRight, Menu, X } from "lucide-react";
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
          ? "border-b border-white/10 bg-slate-950/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <a href="#top" className="flex items-center gap-2">
          <img src="/logo.svg" alt="English Master" className="h-7 w-7" />
          <span className="text-base font-bold text-white md:text-lg">
            English Master
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            onClick={() => navigate(isAuthed ? ROUTES.HOME : ROUTES.LOGIN)}
            className="gap-1.5 bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-400 hover:to-violet-400"
          >
            {isAuthed ? "Vào ứng dụng" : "Bắt đầu miễn phí"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-md text-white md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <Button
              onClick={() => {
                setMobileOpen(false);
                navigate(isAuthed ? ROUTES.HOME : ROUTES.LOGIN);
              }}
              className="mt-2 w-full gap-1.5 bg-gradient-to-r from-blue-500 to-violet-500 text-white"
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
