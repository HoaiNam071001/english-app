// Domain logic cho hệ thống phím tắt: parse/so khớp/định dạng tổ hợp phím,
// danh sách phím khả dụng để edit, validate tổ hợp do user tự chọn, và gom nhóm
// catalog theo Trang > Section để hiển thị.
import type { MutableRefObject } from "react";

export interface ShortcutBinding {
  /** Id ổn định, duy nhất toàn app. Bắt buộc để lưu override & phát hiện trùng. */
  id: string;
  /** Tổ hợp phím mặc định, ví dụ: "mod+k", "mod+shift+l", "enter", "esc" */
  combo: string;
  /** Mô tả hiển thị trong modal Phím tắt / trang Profile */
  description: string;
  /** true nếu chỉ hiển thị để biết thông tin, không thể edit và không được dispatch */
  displayOnly?: boolean;
  /** Bỏ qua nếu displayOnly = true */
  handler?: (event: KeyboardEvent) => void;
  /** Điều kiện bổ sung để kích hoạt */
  when?: () => boolean;
  /** Mặc định true: chặn hành vi mặc định của trình duyệt khi khớp */
  preventDefault?: boolean;
  /** Mặc định false: bỏ qua các lần lặp khi giữ phím */
  allowRepeat?: boolean;
}

export interface ShortcutCatalogEntry {
  key: string;
  page: string;
  section?: string;
  bindingsRef: MutableRefObject<ShortcutBinding[]>;
  isActive: boolean;
  order: number;
  activeOrder: number;
}

interface ParsedCombo {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
}

export const isMacPlatform = () =>
  typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const KEY_ALIASES: Record<string, string> = {
  esc: "escape",
  escape: "escape",
  return: "enter",
  enter: "enter",
  space: " ",
  spacebar: " ",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  del: "delete",
  delete: "delete",
};

const normalizeKey = (raw: string): string => {
  const lower = raw.toLowerCase();
  return KEY_ALIASES[lower] ?? lower;
};

export const MODIFIER_TOKENS = ["ctrl", "alt", "shift", "meta"] as const;
export type ModifierToken = (typeof MODIFIER_TOKENS)[number];

export const isModifierToken = (token: string): boolean =>
  (MODIFIER_TOKENS as readonly string[]).includes(token);

export const parseCombo = (combo: string): ParsedCombo => {
  const parsed: ParsedCombo = { ctrl: false, alt: false, shift: false, meta: false, key: "" };

  combo
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      switch (part.toLowerCase()) {
        case "ctrl":
        case "control":
          parsed.ctrl = true;
          break;
        case "alt":
        case "option":
          parsed.alt = true;
          break;
        case "shift":
          parsed.shift = true;
          break;
        case "meta":
        case "cmd":
        case "command":
        case "win":
          parsed.meta = true;
          break;
        case "mod":
          if (isMacPlatform()) parsed.meta = true;
          else parsed.ctrl = true;
          break;
        default:
          parsed.key = normalizeKey(part);
      }
    });

  return parsed;
};

const comboFromEvent = (event: KeyboardEvent): ParsedCombo => ({
  ctrl: event.ctrlKey,
  alt: event.altKey,
  shift: event.shiftKey,
  meta: event.metaKey,
  key: normalizeKey(event.key),
});

export const comboMatches = (combo: string, event: KeyboardEvent): boolean => {
  if (!combo) return false;
  const target = parseCombo(combo);
  const actual = comboFromEvent(event);
  return (
    target.ctrl === actual.ctrl &&
    target.alt === actual.alt &&
    target.shift === actual.shift &&
    target.meta === actual.meta &&
    target.key === actual.key
  );
};

/** Tổ hợp có Ctrl/Alt/Meta thì vẫn được phép kích hoạt khi đang gõ trong input/textarea */
export const hasModifierKey = (combo: string): boolean => {
  const parsed = parseCombo(combo);
  return parsed.ctrl || parsed.alt || parsed.meta;
};

export const combosEqual = (a: string, b: string): boolean => {
  if (!a || !b) return false;
  const pa = parseCombo(a);
  const pb = parseCombo(b);
  return (
    pa.ctrl === pb.ctrl &&
    pa.alt === pb.alt &&
    pa.shift === pb.shift &&
    pa.meta === pb.meta &&
    pa.key === pb.key
  );
};

/** override "" nghĩa là tính năng bị tắt (không có phím tắt); undefined = dùng combo mặc định */
export const resolveEffectiveCombo = (
  binding: ShortcutBinding,
  overrides: Record<string, string>
): string => {
  const override = overrides[binding.id];
  return override !== undefined ? override : binding.combo;
};

export const comboToTokens = (combo: string): string[] => {
  if (!combo) return [];
  const p = parseCombo(combo);
  const tokens: string[] = [];
  if (p.ctrl) tokens.push("ctrl");
  if (p.alt) tokens.push("alt");
  if (p.shift) tokens.push("shift");
  if (p.meta) tokens.push("meta");
  if (p.key) tokens.push(p.key);
  return tokens;
};

export const tokensToCombo = (tokens: string[]): string =>
  tokens.filter(Boolean).join("+");

const KEY_LABELS: Record<string, string> = {
  " ": "Space",
  escape: "Esc",
  enter: "Enter",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
};

const formatSingleKeyLabel = (key: string): string => {
  if (KEY_LABELS[key]) return KEY_LABELS[key];
  if (key.length === 1) return key.toUpperCase();
  return key.charAt(0).toUpperCase() + key.slice(1);
};

export const formatComboLabel = (combo: string): string[] => {
  const parsed = parseCombo(combo);
  const isMac = isMacPlatform();
  const parts: string[] = [];

  if (parsed.ctrl) parts.push(isMac ? "⌃" : "Ctrl");
  if (parsed.alt) parts.push(isMac ? "⌥" : "Alt");
  if (parsed.shift) parts.push("Shift");
  if (parsed.meta) parts.push(isMac ? "⌘" : "Win");
  if (parsed.key) parts.push(formatSingleKeyLabel(parsed.key));

  return parts;
};

// ==========================================
// Danh sách phím khả dụng để user tự chọn khi edit 1 shortcut
// ==========================================
export interface KeyOption {
  value: string;
  label: string;
}

export const KEY_OPTION_GROUPS: { group: string; options: KeyOption[] }[] = [
  {
    group: "Phím bổ trợ",
    options: [
      { value: "ctrl", label: "Ctrl" },
      { value: "alt", label: "Alt" },
      { value: "shift", label: "Shift" },
      { value: "meta", label: isMacPlatform() ? "Cmd" : "Win" },
    ],
  },
  {
    group: "Chữ cái",
    options: Array.from({ length: 26 }, (_, i) => {
      const c = String.fromCharCode(97 + i);
      return { value: c, label: c.toUpperCase() };
    }),
  },
  {
    group: "Số",
    options: Array.from({ length: 10 }, (_, i) => ({
      value: String(i),
      label: String(i),
    })),
  },
  {
    group: "Phím chức năng",
    options: Array.from({ length: 12 }, (_, i) => ({
      value: `f${i + 1}`,
      label: `F${i + 1}`,
    })),
  },
  {
    group: "Điều hướng",
    options: [
      { value: "arrowup", label: "↑ Up" },
      { value: "arrowdown", label: "↓ Down" },
      { value: "arrowleft", label: "← Left" },
      { value: "arrowright", label: "→ Right" },
      { value: "home", label: "Home" },
      { value: "end", label: "End" },
      { value: "pageup", label: "Page Up" },
      { value: "pagedown", label: "Page Down" },
      { value: "tab", label: "Tab" },
    ],
  },
  {
    group: "Đặc biệt",
    options: [
      { value: "enter", label: "Enter" },
      { value: "escape", label: "Esc" },
      { value: " ", label: "Space" },
      { value: "backspace", label: "Backspace" },
      { value: "delete", label: "Delete" },
    ],
  },
  {
    group: "Ký hiệu",
    options: [
      { value: "/", label: "/" },
      { value: "\\", label: "\\" },
      { value: "-", label: "-" },
      { value: "=", label: "=" },
      { value: "[", label: "[" },
      { value: "]", label: "]" },
      { value: ";", label: ";" },
      { value: "'", label: "'" },
      { value: ",", label: "," },
      { value: ".", label: "." },
      { value: "`", label: "`" },
    ],
  },
];

export const ALL_KEY_OPTIONS: KeyOption[] = KEY_OPTION_GROUPS.flatMap(
  (g) => g.options
);

// ==========================================
// Validate tổ hợp phím do user tự edit
// ==========================================
const RESERVED_COMBOS = [
  "ctrl+w",
  "ctrl+t",
  "ctrl+n",
  "ctrl+q",
  "ctrl+tab",
  "ctrl+shift+tab",
  "ctrl+shift+w",
  "ctrl+shift+t",
  "ctrl+shift+n",
  "ctrl+shift+q",
  "ctrl+r",
  "ctrl+shift+r",
  "ctrl+p",
  "alt+f4",
  "f5",
  "f11",
  "f12",
];

export interface ComboValidation {
  level: "ok" | "warning" | "error";
  message?: string;
}

/** Chỉ được chọn tối đa 1 phím chính (không phải modifier) vì 1 sự kiện bàn phím
 * chỉ có thể mang theo các cờ modifier + 1 phím thực tế được nhấn. */
export const validateComboTokens = (tokens: string[]): ComboValidation => {
  const clean = tokens.filter(Boolean);

  if (clean.length === 0) {
    return { level: "error", message: "Chưa chọn phím nào." };
  }

  const uniq = new Set(clean);
  if (uniq.size !== clean.length) {
    return {
      level: "error",
      message: "Không thể chọn trùng một phím trong cùng tổ hợp.",
    };
  }

  const mainKeys = clean.filter((t) => !isModifierToken(t));
  if (mainKeys.length === 0) {
    return {
      level: "error",
      message:
        "Tổ hợp cần có ít nhất 1 phím chính (không phải Ctrl/Alt/Shift/Meta).",
    };
  }
  if (mainKeys.length > 1) {
    return {
      level: "error",
      message: "Chỉ được chọn tối đa 1 phím chính trong 1 tổ hợp.",
    };
  }

  const combo = tokensToCombo(clean);
  if (RESERVED_COMBOS.some((r) => combosEqual(r, combo))) {
    return {
      level: "error",
      message:
        "Tổ hợp này được trình duyệt/hệ điều hành dùng riêng, không thể ghi đè.",
    };
  }

  const hasModifier = clean.some((t) => isModifierToken(t));
  if (!hasModifier) {
    return {
      level: "warning",
      message:
        "Không có phím bổ trợ (Ctrl/Alt/Shift) — dễ bị kích hoạt ngoài ý muốn khi thao tác ngoài ô nhập liệu.",
    };
  }

  return { level: "ok" };
};

// ==========================================
// Gom nhóm catalog theo Trang > Section (2 cấp) để hiển thị
// ==========================================
export interface ShortcutSectionGroup {
  key: string;
  section: string;
  isActive: boolean;
  bindings: ShortcutBinding[];
}

export interface ShortcutPageGroup {
  key: string;
  page: string;
  isActive: boolean;
  directBindings: ShortcutBinding[];
  sections: ShortcutSectionGroup[];
}

/** Định nghĩa tĩnh 1 binding (không có handler/when) — dùng làm placeholder hiển thị
 * trước khi trang/thành phần thật sự được mount lần nào trong phiên. */
export type StaticShortcutDef = Omit<ShortcutBinding, "handler" | "when">;

export interface StaticShortcutGroup {
  page: string;
  section?: string;
  defs: StaticShortcutDef[];
}

const ensurePage = (
  pages: Map<string, ShortcutPageGroup>,
  pageName: string
): ShortcutPageGroup => {
  let pageGroup = pages.get(pageName);
  if (!pageGroup) {
    pageGroup = {
      key: pageName,
      page: pageName,
      isActive: false,
      directBindings: [],
      sections: [],
    };
    pages.set(pageName, pageGroup);
  }
  return pageGroup;
};

/**
 * Gom catalog (runtime, chỉ chứa những gì đã từng mount trong phiên) theo Trang >
 * Section. `staticCatalog` (nếu truyền vào) luôn được seed trước tiên để mọi phím
 * tắt đã khai báo đều hiển thị ngay cả khi chưa từng mở — runtime sẽ ghi đè lên
 * placeholder đó bằng dữ liệu thật (mô tả động, trạng thái active) khi đã mount.
 */
export const buildPageGroups = (
  catalog: ShortcutCatalogEntry[],
  staticCatalog: StaticShortcutGroup[] = []
): ShortcutPageGroup[] => {
  const pages = new Map<string, ShortcutPageGroup>();

  for (const group of staticCatalog) {
    const pageGroup = ensurePage(pages, group.page);
    const bindings: ShortcutBinding[] = group.defs.map((d) => ({ ...d }));
    if (!group.section) {
      pageGroup.directBindings.push(...bindings);
    } else {
      pageGroup.sections.push({
        key: `${group.page}::${group.section}`,
        section: group.section,
        isActive: false,
        bindings,
      });
    }
  }

  const sorted = [...catalog].sort((a, b) => a.order - b.order);
  for (const entry of sorted) {
    const bindings = entry.bindingsRef.current;
    if (!bindings || bindings.length === 0) continue;

    const pageGroup = ensurePage(pages, entry.page);
    if (entry.isActive) pageGroup.isActive = true;

    if (!entry.section) {
      pageGroup.directBindings = bindings;
    } else {
      const idx = pageGroup.sections.findIndex((s) => s.key === entry.key);
      const sectionGroup: ShortcutSectionGroup = {
        key: entry.key,
        section: entry.section,
        isActive: entry.isActive,
        bindings,
      };
      if (idx >= 0) pageGroup.sections[idx] = sectionGroup;
      else pageGroup.sections.push(sectionGroup);
    }
  }

  return Array.from(pages.values());
};

export interface FlatShortcutEntry {
  binding: ShortcutBinding;
  groupLabel: string;
}

/** Làm phẳng danh sách page>section thành 1 mảng {binding, groupLabel} — dùng để
 * kiểm tra trùng phím tắt trên toàn bộ những gì đang biết (kể cả chưa active). */
export const flattenPageGroups = (
  pageGroups: ShortcutPageGroup[]
): FlatShortcutEntry[] => {
  const result: FlatShortcutEntry[] = [];
  for (const page of pageGroups) {
    for (const b of page.directBindings) {
      result.push({ binding: b, groupLabel: page.page });
    }
    for (const section of page.sections) {
      const groupLabel = `${page.page} · ${section.section}`;
      for (const b of section.bindings) {
        result.push({ binding: b, groupLabel });
      }
    }
  }
  return result;
};
