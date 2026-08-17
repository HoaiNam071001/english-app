import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Plus, Share, Sparkles, X, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Banner gợi ý cài đặt PWA, chỉ hiển thị ở mobile và neo ở đáy màn hình.
 */
export const PWAInstallPrompt = () => {
  const { t } = useTranslation("common");
  const { isVisible, isIOS, canInstall, install, close } = usePWAInstall();

  // iOS phải hướng dẫn thủ công, còn lại cần có sự kiện cài đặt mới hiện
  const show = isVisible && (canInstall || isIOS);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "110%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            // Vuốt xuống đủ mạnh thì coi như bỏ qua
            if (info.offset.y > 90 || info.velocity.y > 600) close();
          }}
          className="fixed inset-x-0 bottom-0 z-9998 md:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          role="dialog"
          aria-label={t("pwa.install.title")}
        >
          <div className="relative m-3 overflow-hidden rounded-3xl border border-border/70 bg-background/85 shadow-2xl backdrop-blur-xl">
            {/* Vệt sáng brand ở nền cho card đỡ phẳng */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full bg-brand-mid/25 blur-3xl"
            />

            {/* Tay nắm gợi ý có thể vuốt xuống để đóng */}
            <div className="flex justify-center pt-2.5">
              <span className="h-1 w-10 rounded-full bg-muted-foreground/25" />
            </div>

            <button
              type="button"
              onClick={close}
              aria-label={t("pwa.install.dismiss")}
              className="absolute top-2.5 right-2.5 flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="relative px-4 pt-3 pb-4">
              <div className="flex items-start gap-3">
                <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-start to-brand-end p-2 shadow-lg shadow-brand-mid/30">
                  <img
                    src="/logo-x-app.svg"
                    alt=""
                    className="size-full object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1 pr-6">
                  <h3 className="text-base leading-tight font-semibold text-foreground">
                    {t("pwa.install.title")}
                  </h3>
                  <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                    {t("pwa.install.description")}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="size-3.5 text-brand-mid" />
                  {t("pwa.install.benefitFast")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-brand-mid" />
                  {t("pwa.install.benefitOffline")}
                </span>
              </div>

              {canInstall ? (
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1 text-muted-foreground"
                    onClick={close}
                  >
                    {t("pwa.install.later")}
                  </Button>
                  <Button
                    className="flex-2 bg-gradient-to-br from-brand-start to-brand-end text-white shadow-md shadow-brand-mid/30 hover:opacity-90"
                    onClick={install}
                  >
                    <Download className="size-4" />
                    {t("pwa.install.action")}
                  </Button>
                </div>
              ) : (
                <ol className="mt-4 space-y-2 rounded-2xl bg-muted/60 p-3 text-[13px] text-foreground">
                  <li className="flex items-center gap-2.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                      <Share className="size-3.5 text-brand-mid" />
                    </span>
                    <span className="leading-snug">
                      {t("pwa.install.iosStep1")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                      <Plus className="size-3.5 text-brand-mid" />
                    </span>
                    <span className="leading-snug">
                      {t("pwa.install.iosStep2")}
                    </span>
                  </li>
                </ol>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
