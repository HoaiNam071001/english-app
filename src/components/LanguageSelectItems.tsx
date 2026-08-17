import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

/**
 * Hàng chọn ngôn ngữ dùng bên trong dropdown menu người dùng.
 * Không lồng dropdown trong dropdown nên dùng dạng segmented control.
 */
export const LanguageSelectItems = () => {
  const { language, setLanguage, languages } = useLanguage();
  const { t } = useTranslation("common");

  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <span className="text-sm text-popover-foreground">
        {t("language.label")}
      </span>
      <div className="ml-auto flex items-center gap-1 rounded-md border border-border p-0.5">
        {languages.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium transition-colors",
              item.code === language
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};
