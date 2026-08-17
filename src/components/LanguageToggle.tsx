import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { Check, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LanguageToggleProps {
  /**
   * `ghost` - nút icon trong header
   * `inline` - hàng ngang trong menu mobile / dropdown
   */
  variant?: "ghost" | "inline";
  className?: string;
}

export const LanguageToggle = ({
  variant = "ghost",
  className,
}: LanguageToggleProps) => {
  const { language, setLanguage, languages } = useLanguage();
  const { t } = useTranslation("common");

  const current = languages.find((item) => item.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "inline" ? (
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-md px-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground",
              className,
            )}
          >
            <Languages className="h-4 w-4" />
            {current?.label ?? t("language.label")}
          </button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("language.switch")}
            title={t("language.switch")}
            className={className}
          >
            <Languages />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {languages.map((item) => (
          <DropdownMenuItem
            key={item.code}
            className="cursor-pointer"
            onClick={() => setLanguage(item.code)}
          >
            <span className="mr-2">{item.flag}</span>
            <span>{item.label}</span>
            {item.code === language && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
