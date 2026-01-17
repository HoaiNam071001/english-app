import DictionarySearchButton from "@/components/DictionarySearchButton";
import { DisplayText } from "@/components/DisplayText";
import { ImagePreview } from "@/components/ImagePreview";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PhoneticItem, TopicItem, VocabularyItem } from "@/types";
import { playAudio } from "@/utils/audio";
import { BookOpen, Calendar, Check, Volume2, X } from "lucide-react";
import moment from "moment";
import React from "react";
import { PartSpeech } from "./PartSpeech";
import { Phonetic } from "./Phonetic/PhoneticItem";

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
    playAudio(p.audio, item.text, p.accent);
  };

  return (
    <div className="space-y-2 max-h-[70vh] overflow-y-auto w-full max-w-[90vw] md:w-90 md:max-w-none">
      {/* Header Section */}
      <div>
        {/* 1. WORD TEXT & TOPIC */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            {topic && (
              <span
                className={`${badgeBaseClass} text-[12px] whitespace-nowrap text-foreground border-border bg-background`}
              >
                {topic.label}
              </span>
            )}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mt-1">
              <div className="text-lg md:text-xl font-bold break-words text-blue-600">
                {item.text}
              </div>
              <div className="shrink-0">
                <DictionarySearchButton text={item.text} />
              </div>
            </div>
            {/* 2. PART OF SPEECH (Mới thêm) */}
            <div className="flex mt-1 items-center">
              <PartSpeech data={item.partOfSpeech} />
            </div>

            {/* 3. PHONETICS (Mới thêm) */}
            {item.phonetics && item.phonetics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
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
                    <Phonetic accent={pho.accent} text={pho.text} />
                    {/* Audio Button */}
                    {pho.audio && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`p-1 rounded-full transition-colors cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800`}
                              onClick={() => handlePlayAudio(pho)}
                            >
                              <Volume2 size={14} />
                            </div>
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

          {item.imageUrl && (
            <div className="shrink-0">
              <ImagePreview url={item.imageUrl} />
            </div>
          )}
        </div>
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
          <p className="text-sm md:text-base font-medium break-words">{item.meaning}</p>
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
