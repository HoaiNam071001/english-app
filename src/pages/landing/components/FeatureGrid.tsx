import {
  BookOpenCheck,
  Layers,
  Moon,
  PersonStanding,
  Volume2,
  BarChart3,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";

const FEATURES = [
  { icon: Layers, key: "flashcard" },
  { icon: Volume2, key: "pronunciation" },
  { icon: BarChart3, key: "progress" },
  { icon: PersonStanding, key: "guest" },
  { icon: BookOpenCheck, key: "notes" },
  { icon: Moon, key: "theme" },
] as const;

export const FeatureGrid = () => {
  const { t } = useTranslation("landing");

  return (
    <section className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            {t("features.eyebrow")}
          </span>
          <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
            {t("features.title")}
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.key} delay={(idx % 3) * 0.08}>
                <div className="group h-full rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-xl transition-colors hover:border-primary/30 hover:bg-card">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">
                    {t(`features.items.${feature.key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {t(`features.items.${feature.key}.description`)}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
