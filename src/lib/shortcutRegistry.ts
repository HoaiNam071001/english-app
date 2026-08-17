// Danh mục tĩnh (nguồn sự thật) cho toàn bộ phím tắt trong app: id/combo mặc định/
// mô tả/page/section. Dùng để modal Phím tắt và trang Profile luôn hiển thị đầy đủ
// ngay cả khi trang/thành phần tương ứng chưa từng được mở trong phiên hiện tại.
// Mỗi nơi gọi `useShortcuts` nên spread từ đây rồi gắn thêm `handler`, tránh
// khai báo trùng id/combo/description ở 2 nơi.
//
// `description`, `page`, `section` là khoá i18n thuộc namespace "shortcuts";
// UI chịu trách nhiệm dịch khi hiển thị (xem `useShortcutLabel`).
import { StaticShortcutDef, StaticShortcutGroup } from "./shortcuts";

/** Khoá i18n của tên trang, đồng thời là khoá gom nhóm khi register runtime */
export const SHORTCUT_PAGES = {
  GLOBAL: "pages.global",
  HOME: "pages.home",
} as const;

/** Khoá i18n của tên section trong 1 trang */
export const SHORTCUT_SECTIONS = {
  SESSION: "sections.session",
  CREATE_VOCAB: "sections.createVocab",
} as const;

export const GLOBAL_SHORTCUT_DEFS = {
  toggleTheme: {
    id: "global.toggle-theme",
    combo: "mod+shift+l",
    description: "defs.toggleTheme",
  },
  openHelp: {
    id: "global.open-shortcuts-help",
    combo: "mod+/",
    description: "defs.openHelp",
  },
} satisfies Record<string, StaticShortcutDef>;

export const HOME_SESSION_SHORTCUT_DEFS = {
  openCreateVocab: {
    id: "home.open-create-vocab",
    combo: "mod+shift+a",
    description: "defs.openCreateVocab",
  },
  newSession: {
    id: "home.new-session",
    combo: "mod+shift+s",
    description: "defs.newSession",
  },
  closeSession: {
    id: "home.close-session",
    combo: "mod+shift+x",
    description: "defs.closeSession",
  },
  resetSession: {
    id: "home.reset-session",
    combo: "mod+shift+y",
    description: "defs.resetSession",
  },
} satisfies Record<string, StaticShortcutDef>;

export const VOCAB_MODAL_SHORTCUT_DEFS = {
  tabRaw: {
    id: "vocab-modal.tab-raw",
    combo: "mod+1",
    description: "defs.tabRaw",
  },
  tabStructured: {
    id: "vocab-modal.tab-structured",
    combo: "mod+2",
    description: "defs.tabStructured",
  },
  save: {
    id: "vocab-modal.save",
    combo: "mod+enter",
    description: "defs.save",
  },
  saveRowHint: {
    id: "vocab-modal.save-row-hint",
    combo: "enter",
    description: "defs.saveRowHint",
    displayOnly: false,
  },
} satisfies Record<string, StaticShortcutDef>;

export const STATIC_SHORTCUT_CATALOG: StaticShortcutGroup[] = [
  { page: SHORTCUT_PAGES.GLOBAL, defs: Object.values(GLOBAL_SHORTCUT_DEFS) },
  {
    page: SHORTCUT_PAGES.HOME,
    section: SHORTCUT_SECTIONS.SESSION,
    defs: Object.values(HOME_SESSION_SHORTCUT_DEFS),
  },
  {
    page: SHORTCUT_PAGES.HOME,
    section: SHORTCUT_SECTIONS.CREATE_VOCAB,
    defs: Object.values(VOCAB_MODAL_SHORTCUT_DEFS),
  },
];
