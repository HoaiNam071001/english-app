import { WifiOff, Zap, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GradientBlob } from "./GradientBlob";
import { PhoneFrame } from "./DeviceFrame";
import { Reveal } from "./Reveal";

const POINTS = [
  { icon: Smartphone, key: "clean" },
  { icon: WifiOff, key: "offline" },
  { icon: Zap, key: "sync" },
] as const;

export const MobileShowcase = () => {
  const { t } = useTranslation("landing");

  return (
    <section id="mobile" className="relative overflow-hidden py-16 md:py-24">
      <GradientBlob
        className="left-1/2 top-0 h-[26rem] w-[26rem] -translate-x-1/2 bg-gradient-to-br from-brand-start/15 via-brand-end/15 to-transparent"
        duration={22}
      />
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <Reveal direction="left" className="order-2 flex justify-center md:order-1">
            <PhoneFrame src="/home-4.png" alt={t("mobile.imageAlt")} />
          </Reveal>

          <Reveal direction="right" className="order-1 text-center md:order-2 md:text-left">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              {t("mobile.eyebrow")}
            </span>
            <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              {t("mobile.titleLead")}{" "}
              <span className="bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-transparent">
                {t("mobile.titleHighlight")}
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground md:mx-0 md:text-lg">
              {t("mobile.description")}
            </p>

            <div className="mt-8 space-y-5">
              {POINTS.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.key}
                    className="flex items-start gap-4 rounded-2xl border border-border bg-card/70 p-4 text-left backdrop-blur-xl"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">
                        {t(`mobile.points.${point.key}.title`)}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {t(`mobile.points.${point.key}.text`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
