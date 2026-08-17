import { ShortcutGroupList } from "@/components/ShortcutGroupList";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useShortcutsPanel } from "@/contexts/ShortcutsContext";
import { buildPageGroups } from "@/lib/shortcuts";
import { STATIC_SHORTCUT_CATALOG } from "@/lib/shortcutRegistry";
import { Keyboard } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const ShortcutsHelpDialog = () => {
  const { catalog, overrides, isOpen, close } = useShortcutsPanel();
  const { t } = useTranslation("shortcuts");

  const pageGroups = useMemo(
    () => buildPageGroups(catalog, STATIC_SHORTCUT_CATALOG),
    [catalog]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard size={18} /> {t("help.title")}
          </DialogTitle>
          <DialogDescription>
            {t("help.description")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mr-4 pr-4">
          <ShortcutGroupList pageGroups={pageGroups} overrides={overrides} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
