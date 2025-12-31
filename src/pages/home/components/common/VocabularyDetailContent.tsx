import { DisplayText } from "@/components/DisplayText";
import { Button } from "@/components/ui/button"; // Giả sử bạn có component Button
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PhoneticItem, TopicItem, VocabularyItem } from "@/types";
import { BookOpen, Calendar, Check, Volume2, X } from "lucide-react";
import moment from "moment";
import React from "react";

interface VocabularyDetailContentProps {
  item: VocabularyItem;
  topic?: TopicItem;
}

export const VocabularyDetailContent: React.FC<
  VocabularyDetailContentProps
> = ({ item, topic }) => {
  const formatDate = (timestamp: number) => {
    return moment(timestamp).format("HH:mm DD/MM/YYYY");
  };

  const badgeBaseClass =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  // --- AUDIO HANDLER (Tái sử dụng logic từ Edit form) ---
  const handlePlayAudio = (p: PhoneticItem) => {
    if (p.audio) {
      new Audio(p.audio).play();
    } else {
      // Fallback TTS trình duyệt
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.text || "");
      utterance.lang = "en-US"; // Default
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-2 w-90">
      {/* Header Section */}
      <div>
        {/* 1. WORD TEXT & TOPIC */}
        <div className="flex justify-between items-start">
          <div className="text-xl font-bold break-words pr-2 text-blue-600">
            {item.text}
          </div>
          {topic && (
            <span
              className={`${badgeBaseClass} whitespace-nowrap text-foreground border-border bg-background`}
            >
              {topic.label}
            </span>
          )}
        </div>

        {/* 2. PART OF SPEECH (Mới thêm) */}
        {item.partOfSpeech && item.partOfSpeech.length > 0 && (
          <div className="text-sm italic text-muted-foreground">
            {item.partOfSpeech.join(", ")}
          </div>
        )}

        {/* 3. PHONETICS (Mới thêm) */}
        {item.phonetics && item.phonetics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {item.phonetics.map((pho, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted/40 rounded-md pl-2 pr-1 border border-border/40"
              >
                {/* Accent Badge */}
                <span
                  className={`px-1 rounded text-[10px] font-bold uppercase tracking-wider text-blue-500`}
                >
                  {pho.accent || "--"}
                </span>

                {/* IPA Text */}
                <span className="text-[12px] font-mono font-medium text-foreground">
                  {pho.text}
                </span>

                {/* Audio Button */}
                {pho.audio && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-6 w-6 rounded-full ${
                            pho.audio
                              ? "text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => handlePlayAudio(pho)}
                        >
                          <Volume2 size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">
                          {pho.audio ? "Play Audio" : "Text-to-Speech"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Meaning & Example */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
            <BookOpen size={14} /> Meaning
            <div className="ml-auto flex items-center gap-1 whitespace-nowrap">
              {item.isLearned ? (
                <span
                  className={`${badgeBaseClass} border-transparent bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400`}
                >
                  <Check size={12} className="mr-1" /> Learned
                </span>
              ) : (
                <span
                  className={`${badgeBaseClass} border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80`}
                >
                  <X size={12} className="mr-1" /> Not learned
                </span>
              )}
            </div>
          </div>
          <p className="text-base font-medium">{item.meaning}</p>
        </div>

        {item.example && (
          <div className="bg-muted/30 p-3 rounded-md border border-border/50 max-h-[250px] overflow-auto">
            <div className="text-sm text-foreground/80 leading-relaxed">
              <DisplayText text={item.example} />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Metadata: Dates */}
      <div className="grid grid-cols-1 gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar size={12} />
          <span>Created: {formatDate(item.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
