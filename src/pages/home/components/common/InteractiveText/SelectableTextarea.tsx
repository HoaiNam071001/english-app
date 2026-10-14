import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useVocabLink } from "./context";
import { MenuState, SELECTION_HOLD_MS, SelectionMenu } from "./SelectionMenu";

type SelectableTextareaProps = React.ComponentProps<typeof Textarea>;

/** Xoá đoạn đang chọn theo cách React nhận được onChange (và giữ được Ctrl+Z) */
const deleteRange = (el: HTMLTextAreaElement, start: number, end: number) => {
  el.focus();
  el.setSelectionRange(start, end);
  if (document.execCommand("delete")) return;
  // Fallback: set value qua native setter rồi bắn event input cho React
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  setter?.call(el, el.value.slice(0, start) + el.value.slice(end));
  el.setSelectionRange(start, start);
  el.dispatchEvent(new Event("input", { bubbles: true }));
};

/**
 * Textarea có menu Copy / Cut / Tạo từ mới khi bôi đen và giữ ~1s,
 * giống phần mô tả từ (InteractiveText).
 */
export const SelectableTextarea: React.FC<SelectableTextareaProps> = ({
  onPointerDown,
  onPointerUp,
  onKeyUp,
  onBlur,
  onInput,
  ...props
}) => {
  const vocabLink = useVocabLink();
  const ref = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [menu, setMenu] = useState<
    (MenuState & { start: number; end: number }) | null
  >(null);

  const hide = () => {
    window.clearTimeout(timer.current);
    setMenu(null);
  };

  // Hẹn giờ hiện menu; (x, y) là vị trí thả chuột, không có thì lấy mép dưới ô nhập
  const schedule = (point?: { x: number; y: number }) => {
    hide();
    timer.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el || document.activeElement !== el) return;
      const { selectionStart: start, selectionEnd: end } = el;
      const rawText = el.value.slice(start, end);
      const text = rawText.replace(/\s+/g, " ").trim();
      if (!text) return;
      const rect = el.getBoundingClientRect();
      const x = point?.x ?? rect.left + rect.width / 2;
      const y = point?.y ?? rect.bottom;
      setMenu({ x, top: y, bottom: y, text, rawText, start, end });
    }, SELECTION_HOLD_MS);
  };

  useEffect(() => {
    if (!menu) return;
    const isInMenu = (target: EventTarget | null) =>
      target instanceof Node && !!menuRef.current?.contains(target);
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && hide();
    const onScroll = (e: Event) => !isInMenu(e.target) && hide();
    const onPointerDownOutside = (e: PointerEvent) =>
      !isInMenu(e.target) && e.target !== ref.current && hide();
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDownOutside, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", hide);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDownOutside, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", hide);
    };
  }, [menu]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <>
      <Textarea
        ref={ref}
        {...props}
        onPointerDown={(e) => {
          hide();
          onPointerDown?.(e);
        }}
        onPointerUp={(e) => {
          schedule({ x: e.clientX, y: e.clientY });
          onPointerUp?.(e);
        }}
        // Chọn bằng bàn phím (Shift + mũi tên, Ctrl+A)
        onKeyUp={(e) => {
          if (e.shiftKey || e.key === "a" || e.key === "A") schedule();
          else hide();
          onKeyUp?.(e);
        }}
        onInput={(e) => {
          hide();
          onInput?.(e);
        }}
        onBlur={(e) => {
          hide();
          onBlur?.(e);
        }}
      />
      {menu &&
        createPortal(
          <SelectionMenu
            ref={menuRef}
            x={menu.x}
            top={menu.top}
            bottom={menu.bottom}
            text={menu.text}
            rawText={menu.rawText}
            onCreate={vocabLink?.createWord}
            onCut={() => {
              if (ref.current) deleteRange(ref.current, menu.start, menu.end);
            }}
            onDone={() => setMenu(null)}
          />,
          document.body,
        )}
    </>
  );
};
