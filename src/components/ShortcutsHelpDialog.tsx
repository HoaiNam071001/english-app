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

export const ShortcutsHelpDialog = () => {
  const { catalog, overrides, isOpen, close } = useShortcutsPanel();

  const pageGroups = useMemo(
    () => buildPageGroups(catalog, STATIC_SHORTCUT_CATALOG),
    [catalog]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard size={18} /> Phím tắt
          </DialogTitle>
          <DialogDescription>
            Toàn bộ phím tắt của app, theo Trang rồi tới thành phần. Nhóm "Chưa mở"
            hiện đang không áp dụng vì trang/thành phần đó chưa được mở trong phiên
            này — bấm để xem trước, mở trang đó để dùng được.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mr-4 pr-4">
          <ShortcutGroupList pageGroups={pageGroups} overrides={overrides} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
