import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { BrowserFrame } from "./DeviceFrame";
import { Reveal } from "./Reveal";

interface FeatureShowcaseProps {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  points: { icon: LucideIcon; text: string }[];
  image: string;
  imageAlt: string;
  reverse?: boolean;
}

export const FeatureShowcase = ({
  id,
  eyebrow,
  title,
  description,
  points,
  image,
  imageAlt,
  reverse,
}: FeatureShowcaseProps) => {
  return (
    <section id={id} className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div
          className={cn(
            "grid items-center gap-12 md:grid-cols-2 md:gap-16",
            reverse && "md:[&>*:first-child]:order-2"
          )}
        >
          <Reveal direction={reverse ? "right" : "left"}>
            <BrowserFrame src={image} alt={imageAlt} />
          </Reveal>

          <Reveal direction={reverse ? "left" : "right"} delay={0.1}>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              {description}
            </p>
            <ul className="mt-6 space-y-3">
              {points.map((point, idx) => {
                const Icon = point.icon;
                return (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-sm text-foreground/85 md:text-base"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card/70 text-primary backdrop-blur-xl">
                      <Icon className="h-4 w-4" />
                    </span>
                    {point.text}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
