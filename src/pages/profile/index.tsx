import { ShortcutEditorDialog } from "@/components/ShortcutEditorDialog";
import { ShortcutGroupList } from "@/components/ShortcutGroupList";
import { Button } from "@/components/ui/button";
import { useShortcutsPanel } from "@/contexts/ShortcutsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/hooks/useLanguage";
import { buildPageGroups, ShortcutBinding } from "@/lib/shortcuts";
import { STATIC_SHORTCUT_CATALOG } from "@/lib/shortcutRegistry";
import { Check, Moon, Pencil, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface EditingState {
  binding: ShortcutBinding;
  groupLabel: string;
}

const ProfilePage = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, languages } = useLanguage();
  const { catalog, overrides } = useShortcutsPanel();
  const { t } = useTranslation(["profile", "common"]);
  const [editing, setEditing] = useState<EditingState | null>(null);

  const pageGroups = useMemo(
    () => buildPageGroups(catalog, STATIC_SHORTCUT_CATALOG),
    [catalog]
  );

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* GIAO DIỆN */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wide">
          {t("appearance.title")}
        </h2>
        <div className="flex items-center gap-2 border rounded-md p-3">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setTheme("light")}
          >
            <Sun size={14} /> {t("common:theme.lightShort")}
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setTheme("dark")}
          >
            <Moon size={14} /> {t("common:theme.darkShort")}
          </Button>
        </div>
      </section>

      {/* NGÔN NGỮ */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wide">
            {t("language.title")}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t("language.description")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 border rounded-md p-3">
          {languages.map((item) => (
            <Button
              key={item.code}
              variant={item.code === language ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setLanguage(item.code)}
            >
              <span>{item.flag}</span>
              {item.label}
              {item.code === language && <Check size={14} />}
            </Button>
          ))}
        </div>
      </section>

      {/* PHÍM TẮT */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wide">
            {t("shortcuts.title")}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t("shortcuts.description")}
          </p>
        </div>

        <ShortcutGroupList
          pageGroups={pageGroups}
          overrides={overrides}
          renderActions={(binding, groupLabel) =>
            binding.displayOnly ? (
              <span className="text-[10px] text-muted-foreground italic">
                {t("shortcuts.fixed")}
              </span>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setEditing({ binding, groupLabel })}
                title={t("shortcuts.edit")}
              >
                <Pencil size={12} />
              </Button>
            )
          }
        />
      </section>

      <ShortcutEditorDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        binding={editing?.binding ?? null}
        groupLabel={editing?.groupLabel ?? ""}
      />
    </div>
  );
};

export default ProfilePage;
