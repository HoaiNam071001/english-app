// Danh mục tĩnh (nguồn sự thật) cho toàn bộ phím tắt trong app: id/combo mặc định/
// mô tả/page/section. Dùng để modal Phím tắt và trang Profile luôn hiển thị đầy đủ
// ngay cả khi trang/thành phần tương ứng chưa từng được mở trong phiên hiện tại.
// Mỗi nơi gọi `useShortcuts` nên spread từ đây rồi gắn thêm `handler`, tránh
// khai báo trùng id/combo/description ở 2 nơi.
import { StaticShortcutDef, StaticShortcutGroup } from "./shortcuts";

export const GLOBAL_SHORTCUT_DEFS = {
  toggleTheme: {
    id: "global.toggle-theme",
    combo: "mod+shift+l",
    description: "Chuyển giao diện Sáng / Tối",
  },
  openHelp: {
    id: "global.open-shortcuts-help",
    combo: "mod+/",
    description: "Hiển thị danh sách phím tắt",
  },
} satisfies Record<string, StaticShortcutDef>;

export const HOME_SESSION_SHORTCUT_DEFS = {
  openCreateVocab: {
    id: "home.open-create-vocab",
    combo: "mod+shift+a",
    description: "Mở modal Thêm từ vựng mới",
  },
  newSession: {
    id: "home.new-session",
    combo: "mod+shift+s",
    description: "Tạo session (tab) mới",
  },
  closeSession: {
    id: "home.close-session",
    combo: "mod+shift+x",
    description: "Đóng session đang mở (cần có từ 2 session trở lên)",
  },
  resetSession: {
    id: "home.reset-session",
    combo: "mod+shift+y",
    description: "Reset toàn bộ session (có xác nhận trước khi xoá)",
  },
} satisfies Record<string, StaticShortcutDef>;

export const VOCAB_MODAL_SHORTCUT_DEFS = {
  tabRaw: {
    id: "vocab-modal.tab-raw",
    combo: "mod+1",
    description: "Chuyển sang tab Raw Text",
  },
  tabStructured: {
    id: "vocab-modal.tab-structured",
    combo: "mod+2",
    description: "Chuyển sang tab Structured List",
  },
  save: {
    id: "vocab-modal.save",
    combo: "mod+enter",
    description: "Lưu (Raw Text hoặc Structured List, tuỳ tab đang mở)",
  },
  saveRowHint: {
    id: "vocab-modal.save-row-hint",
    combo: "enter",
    description: "Lưu từ đang nhập (khi focus ở ô Word/Meaning)",
    displayOnly: false,
  },
} satisfies Record<string, StaticShortcutDef>;

export const STATIC_SHORTCUT_CATALOG: StaticShortcutGroup[] = [
  { page: "Toàn ứng dụng", defs: Object.values(GLOBAL_SHORTCUT_DEFS) },
  {
    page: "Trang chủ",
    section: "Phiên học (Session)",
    defs: Object.values(HOME_SESSION_SHORTCUT_DEFS),
  },
  {
    page: "Trang chủ",
    section: "Thêm từ vựng mới",
    defs: Object.values(VOCAB_MODAL_SHORTCUT_DEFS),
  },
];
