import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { VocabularyItem } from "@/types";
import { Copy, Eye, PlusCircle, Scissors } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useVocabLink } from "./context";
import { segmentByVocab } from "./matchVocab";

// Giữ vùng bôi đen bao lâu thì hiện menu
const SELECTION_HOLD_MS = 1000;
const MENU_WIDTH = 180;

interface InteractiveTextProps {
  text: string;
  /** Không highlight chính từ đang được hiển thị */
  excludeId?: string;
  className?: string;
}

/**
 * Hiển thị mô tả của từ:
 * - Highlight các cụm trùng với từ đã có trong bộ từ, hover/tap để xem chi tiết.
 * - Bôi đen và giữ ~1s sẽ hiện menu Copy / Cut / Tạo từ mới.
 */
export const InteractiveText: React.FC<InteractiveTextProps> = ({
  text,
  excludeId,
  className,
}) => {
  const vocabLink = useVocabLink();
  const segments = useMemo(
    () =>
      vocabLink
        ? segmentByVocab(text, vocabLink.entries, excludeId)
        : [{ text, matches: [] }],
    [text, vocabLink, excludeId],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useSelectionMenu(containerRef, menuRef);

  return (
    <div ref={containerRef} className={cn("whitespace-pre-line", className)}>
      {segments.map((seg, i) =>
        seg.matches.length > 0 && vocabLink ? (
          <VocabMatch
            key={i}
            text={seg.text}
            matches={seg.matches}
            onView={vocabLink.viewWord}
          />
        ) : (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        ),
      )}
      {menu &&
        createPortal(
          <SelectionMenu
            ref={menuRef}
            x={menu.x}
            top={menu.top}
            bottom={menu.bottom}
            text={menu.text}
            onCreate={vocabLink?.createWord}
            onDone={() => setMenu(null)}
          />,
          document.body,
        )}
    </div>
  );
};

// ==========================================
// Highlight cụm từ đã có
// ==========================================
interface VocabMatchProps {
  text: string;
  matches: VocabularyItem[];
  onView: (item: VocabularyItem) => void;
}

const VocabMatch: React.FC<VocabMatchProps> = ({ text, matches, onView }) => {
  const { t } = useTranslation("home");
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const schedule = (next: boolean, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), delay);
  };
  const cancel = () => window.clearTimeout(timer.current);

  useEffect(() => cancel, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <span
          className="cursor-pointer rounded-sm bg-amber-400/15 underline decoration-amber-500 decoration-2 underline-offset-[3px] text-foreground transition-colors hover:bg-amber-400/30"
          onMouseEnter={() => schedule(true, 150)}
          onMouseLeave={() => schedule(false, 200)}
          onClick={(e) => {
            e.stopPropagation();
            // Đang bôi đen thì không mở (để không cản thao tác chọn chữ)
            if (!window.getSelection()?.isCollapsed) return;
            cancel();
            setOpen(true);
          }}
        >
          {text}
        </span>
      </PopoverAnchor>
      <PopoverContent
        side="top"
        className="w-auto max-w-[300px] p-1 flex flex-col divide-y divide-border"
        onMouseEnter={cancel}
        onMouseLeave={() => schedule(false, 200)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
      >
        {matches.map((m) => (
          <div key={m.id} className="flex flex-col gap-1 px-2 py-1.5">
            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 break-words">
              {m.text}
            </div>
            {m.meaning && (
              <div className="text-xs font-medium break-words">{m.meaning}</div>
            )}
            {m.example && (
              <div className="text-[11px] italic leading-snug text-muted-foreground whitespace-pre-line line-clamp-3 break-words">
                {m.example}
              </div>
            )}
            <button
              type="button"
              className="mt-0.5 flex w-fit items-center gap-1.5 rounded-sm px-1.5 py-1 -ml-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setOpen(false);
                onView(m);
              }}
            >
              <Eye size={14} className="shrink-0" />
              {t("textLink.viewDetail")}
            </button>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

// ==========================================
// Menu khi bôi đen
// ==========================================
interface MenuState {
  x: number;
  top: number;
  bottom: number;
  text: string;
}

const getSelectionIn = (container: HTMLElement | null) => {
  const sel = window.getSelection();
  if (!container || !sel || sel.isCollapsed || sel.rangeCount === 0)
    return null;
  const range = sel.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;
  const text = sel.toString().replace(/\s+/g, " ").trim();
  return text ? { range, text } : null;
};

const useSelectionMenu = (
  containerRef: React.RefObject<HTMLElement | null>,
  menuRef: React.RefObject<HTMLElement | null>,
) => {
  const [state, setState] = useState<MenuState | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    let pointerDown = false;

    const isInMenu = (target: EventTarget | null) =>
      target instanceof Node && !!menuRef.current?.contains(target);

    const restart = () => {
      window.clearTimeout(timer);
      setState(null);
      if (pointerDown || !getSelectionIn(containerRef.current)) return;
      timer = window.setTimeout(() => {
        const sel = getSelectionIn(containerRef.current);
        if (!sel) return;
        const rect = sel.range.getBoundingClientRect();
        setState({
          x: rect.left + rect.width / 2,
          top: rect.top,
          bottom: rect.bottom,
          text: sel.text,
        });
      }, SELECTION_HOLD_MS);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (isInMenu(e.target)) return;
      pointerDown = true;
      window.clearTimeout(timer);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (isInMenu(e.target)) return;
      pointerDown = false;
      restart();
    };
    const hide = () => {
      window.clearTimeout(timer);
      setState(null);
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && hide();
    const onScroll = (e: Event) => !isInMenu(e.target) && hide();

    document.addEventListener("selectionchange", restart);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", hide);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("selectionchange", restart);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", hide);
    };
  }, [containerRef, menuRef]);

  return [state, setState] as const;
};

interface SelectionMenuProps extends MenuState {
  onCreate?: (text: string) => void;
  onDone: () => void;
}

const SelectionMenu = React.forwardRef<HTMLDivElement, SelectionMenuProps>(
  ({ x, top, bottom, text, onCreate, onDone }, ref) => {
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
        await navigator.clipboard.writeText(text);
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
        {/* Nội dung chỉ đọc nên Cut = copy rồi bỏ vùng chọn */}
        <button
          type="button"
          className={itemClass}
          onClick={run(writeClipboard)}
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
