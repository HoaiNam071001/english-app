import { STORAGE_KEY } from "@/constants";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useCallback, useEffect, useState } from "react";

/** Sự kiện Chrome/Edge bắn ra khi app đủ điều kiện cài đặt (chưa có trong lib DOM) */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Thời gian "ngủ yên" sau khi người dùng bấm bỏ qua: 7 ngày */
const DISMISS_COOLDOWN = 7 * 24 * 60 * 60 * 1000;

/** Trễ một nhịp để banner không nhảy ra ngay lúc app vừa mở */
const SHOW_DELAY = 2500;

const MOBILE_QUERY = "(max-width: 767px)";

const isIOSDevice = () => {
  const ua = window.navigator.userAgent;
  // iPadOS 13+ khai báo user agent giống macOS, phân biệt bằng maxTouchPoints
  const isIPadOS = /Macintosh/i.test(ua) && window.navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/i.test(ua) || isIPadOS;
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.matchMedia("(display-mode: fullscreen)").matches ||
  // Safari iOS dùng thuộc tính riêng
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

/**
 * Quản lý trạng thái gợi ý cài đặt PWA trên mobile.
 * - Android/Chrome: bắt `beforeinstallprompt` rồi gọi lại khi người dùng đồng ý.
 * - iOS/Safari: không có API cài đặt nên chỉ hướng dẫn thao tác thủ công.
 */
export const usePWAInstall = () => {
  const { getStorage, setStorage } = useLocalStorage();

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS] = useState(isIOSDevice);

  const markDismissed = useCallback(() => {
    setStorage(STORAGE_KEY.PWA_INSTALL_DISMISSED_AT, Date.now());
  }, [setStorage]);

  const close = useCallback(() => {
    setIsVisible(false);
    markDismissed();
  }, [markDismissed]);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    // Sự kiện chỉ dùng được một lần, bỏ đi sau khi đã gọi prompt
    setDeferredPrompt(null);
    setIsVisible(false);

    if (outcome === "dismissed") markDismissed();
  }, [deferredPrompt, markDismissed]);

  useEffect(() => {
    // Đã cài rồi hoặc đang chạy trong app thì không gợi ý nữa
    if (isStandalone()) return;
    if (!window.matchMedia(MOBILE_QUERY).matches) return;

    const dismissedAt = getStorage(STORAGE_KEY.PWA_INSTALL_DISMISSED_AT);
    if (
      typeof dismissedAt === "number" &&
      Date.now() - dismissedAt < DISMISS_COOLDOWN
    ) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    const showLater = () => {
      timer = setTimeout(() => setIsVisible(true), SHOW_DELAY);
    };

    const onBeforeInstallPrompt = (event: Event) => {
      // Chặn thanh gợi ý mặc định của trình duyệt để dùng UI riêng
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      showLater();
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iOS không bắn beforeinstallprompt nên chủ động hiện hướng dẫn
    if (isIOSDevice()) showLater();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [getStorage]);

  return {
    isVisible,
    isIOS,
    /** iOS chỉ hướng dẫn thủ công, các nền tảng khác mới có nút cài trực tiếp */
    canInstall: Boolean(deferredPrompt),
    install,
    close,
  };
};

export default usePWAInstall;
