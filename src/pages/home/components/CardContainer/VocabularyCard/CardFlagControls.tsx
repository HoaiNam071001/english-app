import { cn } from "@/lib/utils";
import { VocabularyItem } from "@/types";
import { Eye, EyeOff, ImageIcon, ImageOff } from "lucide-react";

interface CardFlagControlsProps {
  item: VocabularyItem;
  showMeaning: boolean;
  hideImage: boolean;
  isZoomMode: boolean;
  onToggleMeaning: (show: boolean) => void;
  onToggleImage: (hide: boolean) => void;
}

export const CardFlagControls: React.FC<CardFlagControlsProps> = ({
  item,
  showMeaning,
  hideImage,
  isZoomMode,
  onToggleMeaning,
  onToggleImage,
}) => {
  return (
    <div
      className={cn(
        "z-50 shadow-lg backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-evenly gap-2 bg-secondary/50 rounded-full px-1 border border-border/50",
        "duration-300 absolute top-0 left-1/2 -translate-x-1/2 ",
        isZoomMode ? "scale-[150%]" : "",
      )}
    >
      <div
        className="p-1 rounded-full hover:bg-background hover:text-blue-400 transition-all cursor-pointer text-muted-foreground"
        onClick={(e) => {
          e.stopPropagation();
          onToggleMeaning(!showMeaning);
        }}
        title={showMeaning ? "Hide Meaning" : "Show Meaning"}
      >
        {showMeaning ? <Eye size={14} /> : <EyeOff size={14} />}
      </div>

      {item.imageUrl && (
        <div
          className="p-1 rounded-full hover:bg-background hover:text-primary transition-all cursor-pointer text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onToggleImage(!hideImage);
          }}
          title={!hideImage ? "Hide Image" : "Show Image"}
        >
          {hideImage ? <ImageIcon size={14} /> : <ImageOff size={14} />}
        </div>
      )}
    </div>
  );
};
