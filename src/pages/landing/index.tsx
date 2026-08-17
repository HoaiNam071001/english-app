import { useThemedImage } from "@/hooks/useThemedImage";
import { NotebookPen, Table, ListChecks, Users, Import, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CtaSection } from "./components/CtaSection";
import { FeatureGrid } from "./components/FeatureGrid";
import { FeatureShowcase } from "./components/FeatureShowcase";
import { LandingFooter } from "./components/LandingFooter";
import { LandingHeader } from "./components/LandingHeader";
import { HeroSection } from "./components/HeroSection";
import { MobileShowcase } from "./components/MobileShowcase";

const LandingPage = () => {
  const { t } = useTranslation("landing");
  const notesImage = useThemedImage("/home-2.png");
  const communityImage = useThemedImage("/home-3.png");

  useEffect(() => {
    document.title = t("documentTitle");
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = previousBehavior;
    };
  }, [t]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      <LandingHeader />
      <main>
        <HeroSection />

        <FeatureShowcase
          id="features"
          eyebrow={t("notes.eyebrow")}
          title={
            <>
              {t("notes.titleLead")}{" "}
              <span className="bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-transparent">
                {t("notes.titleHighlight")}
              </span>
            </>
          }
          description={t("notes.description")}
          points={[
            { icon: Table, text: t("notes.points.table") },
            { icon: ListChecks, text: t("notes.points.checklist") },
            { icon: NotebookPen, text: t("notes.points.editor") },
          ]}
          image={notesImage}
          imageAlt={t("notes.imageAlt")}
        />

        <FeatureShowcase
          id="community"
          eyebrow={t("community.eyebrow")}
          title={
            <>
              {t("community.titleLead")}{" "}
              <span className="bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-transparent">
                {t("community.titleHighlight")}
              </span>
            </>
          }
          description={t("community.description")}
          points={[
            { icon: Users, text: t("community.points.sets") },
            { icon: Import, text: t("community.points.import") },
            { icon: Sparkles, text: t("community.points.updates") },
          ]}
          image={communityImage}
          imageAlt={t("community.imageAlt")}
          reverse
        />

        <MobileShowcase />

        <FeatureGrid />

        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
