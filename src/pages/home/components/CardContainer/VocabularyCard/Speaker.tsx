import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AccentType, VocabularyItem } from "@/types";
import { playAudio } from "@/utils";
import { Volume2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const Speaker: React.FC<{ item: VocabularyItem }> = ({ item }) => {
  const { t } = useTranslation("home");
  const audioSourceType = useMemo(() => {
    const usAudio = item.phonetics?.find(
      (p) => p.audio && p.accent === AccentType.US,
    );
    if (usAudio?.audio) return AccentType.US;
    const otherAudio = item.phonetics?.find((p) => p.audio);
    if (otherAudio?.audio) return "other";
    return "tts";
  }, [item.phonetics]);

  const speakerStyle = useMemo(() => {
    switch (audioSourceType) {
      case AccentType.US:
        return "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800";
      case "other":
        return "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:hover:bg-cyan-800";
      case "tts":
      default:
        return "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:hover:bg-orange-800";
    }
  }, [audioSourceType]);

  const speakerTooltip = useMemo(() => {
    if (audioSourceType === "us") return t("card.playUsAudio");
    if (audioSourceType === "other") return t("card.playAudio");
    return t("card.browserTts");
  }, [audioSourceType, t]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const usAudio = item.phonetics?.find(
      (p) => p.audio && p.accent === AccentType.US,
    );
    const otherAudio = item.phonetics?.find((p) => p.audio);
    playAudio(
      usAudio?.audio || otherAudio?.audio,
      item.text,
      usAudio?.accent || otherAudio?.accent,
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${speakerStyle}`}
            onClick={handleSpeak}
          >
            <Volume2 size={14} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">{speakerTooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
