import { DisplayText } from "@/components/DisplayText";
import { ImagePreview } from "@/components/ImagePreview";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { VocabularyItem } from "@/types";
import { PartSpeech } from "../../common/PartSpeech";
import { Phonetics } from "../../common/Phonetic";

interface CardMainContentProps {
  item: VocabularyItem;
  showMeaning: boolean;
  hideImage: boolean;
  isZoomMode: boolean;
}

export const CardMainContent: React.FC<CardMainContentProps> = ({
  item,
  showMeaning,
  hideImage,
  isZoomMode,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center w-full h-full overflow-hidden",
        isZoomMode ? "p-8 gap-2" : "py-4",
      )}
    >
      {/* --- PHẦN TRÊN (50%) --- */}
      <div className="h-[55%] w-full flex flex-col items-center justify-end">
        {/* Meta info: Part of speech & Phonetics */}
        <div
          className={cn(
            "flex items-center flex-col",
            isZoomMode ? "gap-1 scale-[200%] mb-10" : "",
          )}
        >
          <PartSpeech data={item.partOfSpeech} />
          <Phonetics item={item} />
        </div>

        {/* Main Text */}
        {item.example ? (
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "font-bold text-foreground cursor-help decoration-dashed underline decoration-border underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center w-full px-2",
                  isZoomMode ? "text-5xl my-1" : "text-lg line-clamp-2",
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {item.text}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="max-w-[90vh] p-3 bg-popover/95 backdrop-blur shadow-xl text-sm"
              side="top"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="font-semibold text-popover-foreground border-b border-border pb-1">
                Note:
              </div>
              <div className="text-popover-foreground/80 italic leading-relaxed max-h-[300px] overflow-auto">
                <DisplayText text={item.example} />
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <div
            className={cn(
              "font-bold text-foreground text-center w-full px-2",
              isZoomMode ? "text-5xl my-1" : "text-lg line-clamp-2",
            )}
            title={item.text}
          >
            {item.text}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="shrink-0 w-12 h-[1px] bg-border/60 rounded-full"></div>

      {/* --- PHẦN DƯỚI (50%) --- */}
      <div className="h-[45%] w-full flex flex-col items-center justify-start gap-1">
        {/* Meaning */}
        <div className="relative w-full flex justify-center px-2 shrink-0">
          <div
            className={cn(
              "inline-block text-center w-full leading-normal text-muted-foreground italic transition-all duration-300",
              showMeaning
                ? "opacity-100 blur-0"
                : "opacity-30 blur-md select-none grayscale",
              isZoomMode
                ? "text-2xl whitespace-normal"
                : "text-[12px] truncate",
            )}
          >
            {item.meaning}
          </div>
        </div>

        {/* Image */}
        {!!item.imageUrl && !hideImage && (
          <div className="flex-1 flex items-center justify-center min-h-0 w-full">
            <div className="relative max-h-full">
              <ImagePreview
                url={item.imageUrl}
                // Tùy chỉnh size ảnh phù hợp với không gian còn lại
                h={isZoomMode ? 250 : 60}
                w={isZoomMode ? 250 : 100}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
