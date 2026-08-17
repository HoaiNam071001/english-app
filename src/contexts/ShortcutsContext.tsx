import { ShortcutsHelpDialog } from "@/components/ShortcutsHelpDialog";
import { useAuth } from "@/hooks/useAuth";
import { GLOBAL_SHORTCUT_DEFS } from "@/lib/shortcutRegistry";
import {
  comboMatches,
  hasModifierKey,
  resolveEffectiveCombo,
  ShortcutBinding,
  ShortcutCatalogEntry,
} from "@/lib/shortcuts";
import { FirebaseSettingsService } from "@/services/settings/firebase.adapter";
import { GuestSettingsService } from "@/services/settings/guest.adapter";
import { ISettingsService } from "@/services/settings/types";
import {
  createContext,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTheme } from "./ThemeContext";

interface ShortcutsContextType {
  registerScope: (
    page: string,
    section: string | undefined,
    bindingsRef: MutableRefObject<ShortcutBinding[]>
  ) => void;
  unregisterScope: (page: string, section: string | undefined) => void;
  catalog: ShortcutCatalogEntry[];
  isHelpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
  overrides: Record<string, string>;
  /** combo=null xoá override (dùng lại mặc định), combo="" nghĩa là tắt phím tắt đó */
  setOverride: (id: string, combo: string | null) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ShortcutsContext = createContext<ShortcutsContextType | undefined>(
  undefined
);

let orderCounter = 0;
let activeOrderCounter = 0;

export const ShortcutsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { userProfile } = useAuth();
  const userId = userProfile?.id;

  // User đã đăng nhập -> lưu Firestore (collection "user_settings", 1 doc/user).
  // Guest -> vẫn lưu localStorage như cũ (không có tài khoản để đồng bộ).
  const settingsService: ISettingsService = useMemo(
    () =>
      userId ? new FirebaseSettingsService(userId) : new GuestSettingsService(),
    [userId]
  );

  const [catalogMap, setCatalogMap] = useState<Map<string, ShortcutCatalogEntry>>(
    new Map()
  );
  const catalogRef = useRef(catalogMap);
  useEffect(() => {
    catalogRef.current = catalogMap;
  }, [catalogMap]);

  const mountCounts = useRef<Map<string, number>>(new Map());

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const openHelp = useCallback(() => setIsHelpOpen(true), []);
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);

  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const overridesRef = useRef(overrides);
  useEffect(() => {
    overridesRef.current = overrides;
  }, [overrides]);

  // Nạp lại override mỗi khi đổi service (đăng nhập/đăng xuất/chuyển tài khoản)
  useEffect(() => {
    let cancelled = false;
    settingsService.getShortcutOverrides().then((data) => {
      if (!cancelled) setOverrides(data);
    });
    return () => {
      cancelled = true;
    };
  }, [settingsService]);

  const setOverride = useCallback(
    (id: string, combo: string | null) => {
      setOverrides((prev) => {
        const next = { ...prev };
        if (combo === null) {
          delete next[id];
        } else {
          next[id] = combo;
        }
        settingsService.setShortcutOverrides(next).catch((err) => {
          console.error("Failed to save shortcut overrides:", err);
        });
        return next;
      });
    },
    [settingsService]
  );

  const registerScope = useCallback(
    (
      page: string,
      section: string | undefined,
      bindingsRef: MutableRefObject<ShortcutBinding[]>
    ) => {
      const key = `${page}::${section ?? ""}`;
      mountCounts.current.set(key, (mountCounts.current.get(key) ?? 0) + 1);

      setCatalogMap((prev) => {
        const next = new Map(prev);
        const existing = next.get(key);
        next.set(key, {
          key,
          page,
          section,
          bindingsRef,
          isActive: true,
          order: existing?.order ?? ++orderCounter,
          activeOrder: ++activeOrderCounter,
        });
        return next;
      });
    },
    []
  );

  const unregisterScope = useCallback(
    (page: string, section: string | undefined) => {
      const key = `${page}::${section ?? ""}`;
      const remaining = Math.max(0, (mountCounts.current.get(key) ?? 1) - 1);
      mountCounts.current.set(key, remaining);
      if (remaining > 0) return;

      setCatalogMap((prev) => {
        const existing = prev.get(key);
        if (!existing) return prev;
        const next = new Map(prev);
        next.set(key, { ...existing, isActive: false });
        return next;
      });
    },
    []
  );

  // Bộ lắng nghe keydown duy nhất cho toàn app. Scope active gần nhất được kiểm tra
  // trước, nên tự động override scope active trước đó (global/page) nếu trùng combo.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      const activeEntries = Array.from(catalogRef.current.values())
        .filter((e) => e.isActive)
        .sort((a, b) => b.activeOrder - a.activeOrder);

      for (const entry of activeEntries) {
        const binding = entry.bindingsRef.current.find((b) => {
          if (b.displayOnly || !b.handler) return false;
          const effectiveCombo = resolveEffectiveCombo(b, overridesRef.current);
          if (!effectiveCombo) return false;
          return comboMatches(effectiveCombo, event);
        });
        if (!binding) continue;

        if (event.repeat && !binding.allowRepeat) return;

        const effectiveCombo = resolveEffectiveCombo(binding, overridesRef.current);
        if (isEditable && !hasModifierKey(effectiveCombo)) continue;
        if (binding.when && !binding.when()) continue;

        if (binding.preventDefault !== false) event.preventDefault();
        binding.handler?.(event);
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const catalog = useMemo(() => Array.from(catalogMap.values()), [catalogMap]);

  return (
    <ShortcutsContext.Provider
      value={{
        registerScope,
        unregisterScope,
        catalog,
        isHelpOpen,
        openHelp,
        closeHelp,
        overrides,
        setOverride,
      }}
    >
      <GlobalShortcuts />
      {children}
      <ShortcutsHelpDialog />
    </ShortcutsContext.Provider>
  );
};

const GlobalShortcuts: React.FC = () => {
  const { toggleTheme } = useTheme();
  const { open: openHelp } = useShortcutsPanel();

  useShortcuts({ page: "Toàn ứng dụng" }, [
    { ...GLOBAL_SHORTCUT_DEFS.toggleTheme, handler: () => toggleTheme() },
    { ...GLOBAL_SHORTCUT_DEFS.openHelp, handler: () => openHelp() },
  ]);

  return null;
};

/**
 * Đăng ký một nhóm phím tắt cho toàn app, 1 trang, hoặc 1 component (vd: modal),
 * gắn với 1 cặp (page, section) dùng để gom nhóm hiển thị 2 cấp.
 * Nhóm active gần nhất (mount sau) sẽ override nhóm active trước đó nếu trùng combo.
 * Khi unmount, nhóm không bị xoá khỏi catalog mà chỉ chuyển sang trạng thái "không active"
 * (để modal Phím tắt / trang Profile vẫn hiển thị được toàn bộ phím tắt đã từng biết).
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useShortcuts = (
  scope: { page: string; section?: string },
  bindings: ShortcutBinding[],
  options: { enabled?: boolean } = {}
) => {
  const context = useContext(ShortcutsContext);
  if (!context) {
    throw new Error("useShortcuts must be used within a ShortcutsProvider");
  }
  const { registerScope, unregisterScope } = context;
  const enabled = options.enabled ?? true;
  const { page, section } = scope;

  const bindingsRef = useRef<ShortcutBinding[]>(bindings);
  bindingsRef.current = bindings;

  useEffect(() => {
    if (!enabled) return;
    registerScope(page, section, bindingsRef);
    return () => unregisterScope(page, section);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, section, enabled]);
};

/** Truy cập toàn bộ catalog phím tắt (kể cả không active) + điều khiển modal Phím tắt + override */
// eslint-disable-next-line react-refresh/only-export-components
export const useShortcutsPanel = () => {
  const context = useContext(ShortcutsContext);
  if (!context) {
    throw new Error("useShortcutsPanel must be used within a ShortcutsProvider");
  }
  return {
    catalog: context.catalog,
    isOpen: context.isHelpOpen,
    open: context.openHelp,
    close: context.closeHelp,
    overrides: context.overrides,
    setOverride: context.setOverride,
  };
};
