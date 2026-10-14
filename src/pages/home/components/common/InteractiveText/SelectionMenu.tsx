import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { Copy, PlusCircle, Scissors } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

// Giữ vùng bôi đen bao lâu thì hiện menu
export const SELECTION_HOLD_MS = 1000;
const MENU_WIDTH = 180;

export interface MenuState {
  x: number;
  top: number;
  bottom: number;
  /** Text đã gộp khoảng trắng, dùng để tạo từ */
  text: string;
  /** Text gốc (giữ xuống dòng) để copy; mặc định dùng `text` */
  rawText?: string;
}

interface SelectionMenuProps extends MenuState {
  onCreate?: (text: string) => void;
  /** Xoá phần đã chọn sau khi copy (ô nhập). Không truyền = nội dung chỉ đọc */
  onCut?: () => void;
  onDone: () => void;
}

export const SelectionMenu = React.forwardRef<HTMLDivElement, SelectionMenuProps>(
  ({ x, top, bottom, text, rawText, onCreate, onCut, onDone }, ref) => {
    const { t } = useTranslation(["home", "common"]);
    const toast = useToast();

    const left = Math.min(
      Math.max(8, x - MENU_WIDTH / 2),
      window.innerWidth - MENU_WIDTH - 8,
    );
    // Không đủ chỗ phía dưới thì hiện lên trên vùng chọn
    const placeAbove = bottom + 140 > window.innerHeight;

    const writeClipboard = async () => {
      try {
        await navigator.clipboard.writeText(rawText ?? text);
        toast.success(t("textLink.copied"));
      } catch {
        toast.error(t("textLink.copyFailed"));
      }
    };

    const run = (action: () => void) => () => {
      action();
      window.getSelection()?.removeAllRanges();
      onDone();
    };

    const itemClass =
      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground";

    return (
      <div
        ref={ref}
        role="menu"
        className="fixed z-[300] rounded-md border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
        style={{
          left,
          width: MENU_WIDTH,
          pointerEvents: "auto",
          ...(placeAbove
            ? { bottom: window.innerHeight - top + 6 }
            : { top: bottom + 6 }),
        }}
        // Giữ nguyên vùng bôi đen & focus khi bấm vào menu
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={itemClass}
          onClick={run(writeClipboard)}
        >
          <Copy size={14} /> {t("common:actions.copy")}
        </button>
        {/* Nội dung chỉ đọc thì Cut = copy rồi bỏ vùng chọn */}
        <button
          type="button"
          className={itemClass}
          onClick={run(() => {
            writeClipboard();
            onCut?.();
          })}
        >
          <Scissors size={14} /> {t("textLink.cut")}
        </button>
        {onCreate && (
          <>
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              className={cn(itemClass, "text-blue-600 dark:text-blue-400")}
              onClick={run(() => onCreate(text))}
            >
              <PlusCircle size={14} /> {t("textLink.createWord")}
            </button>
          </>
        )}
      </div>
    );
  },
);
SelectionMenu.displayName = "SelectionMenu";
