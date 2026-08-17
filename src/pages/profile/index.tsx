import { ShortcutEditorDialog } from "@/components/ShortcutEditorDialog";
import { ShortcutGroupList } from "@/components/ShortcutGroupList";
import { Button } from "@/components/ui/button";
import { useShortcutsPanel } from "@/contexts/ShortcutsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { buildPageGroups, ShortcutBinding } from "@/lib/shortcuts";
import { STATIC_SHORTCUT_CATALOG } from "@/lib/shortcutRegistry";
import { Moon, Pencil, Sun } from "lucide-react";
import { useMemo, useState } from "react";

interface EditingState {
  binding: ShortcutBinding;
  groupLabel: string;
}

const ProfilePage = () => {
  const { theme, setTheme } = useTheme();
  const { catalog, overrides } = useShortcutsPanel();
  const [editing, setEditing] = useState<EditingState | null>(null);

  const pageGroups = useMemo(
    () => buildPageGroups(catalog, STATIC_SHORTCUT_CATALOG),
    [catalog]
  );

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold">Cá nhân hoá</h1>
        <p className="text-sm text-muted-foreground">
          Cấu hình giao diện và phím tắt cho tài khoản của bạn.
        </p>
      </div>

      {/* GIAO DIỆN */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wide">
          Giao diện
        </h2>
        <div className="flex items-center gap-2 border rounded-md p-3">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setTheme("light")}
          >
            <Sun size={14} /> Sáng
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setTheme("dark")}
          >
            <Moon size={14} /> Tối
          </Button>
        </div>
      </section>

      {/* PHÍM TẮT */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wide">
            Phím tắt
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Nhóm "Chưa mở" là những trang/thành phần bạn chưa mở trong phiên này —
            hãy mở chúng ít nhất 1 lần để phím tắt xuất hiện ở đây. Mỗi phím tắt có
            thể sửa tối đa 4 phím (tối đa 3 phím bổ trợ + 1 phím chính).
          </p>
        </div>

        <ShortcutGroupList
          pageGroups={pageGroups}
          overrides={overrides}
          renderActions={(binding, groupLabel) =>
            binding.displayOnly ? (
              <span className="text-[10px] text-muted-foreground italic">
                Cố định
              </span>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setEditing({ binding, groupLabel })}
                title="Sửa phím tắt"
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
