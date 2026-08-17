import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

export const ThemeToggle = ({ text }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation("common");

  return (
    <div
      className="inline-flex items-center w-full cursor-pointer"
      onClick={toggleTheme}
    >
      {text && <span className="text-sm text-popover-foreground">{text}</span>}

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 ml-auto"
        aria-label={t("theme.toggle")}
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};
