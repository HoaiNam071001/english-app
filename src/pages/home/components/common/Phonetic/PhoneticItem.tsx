import { cn } from "@/lib/utils";
import { AccentType } from "@/types";

export const Phonetic = ({
  accent,
  text,
  className = "",
}: {
  accent: string;
  text: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        `text-[12px] inline-block font-mono tracking-wider`,
        accent === AccentType.US && "text-blue-300",
        accent === AccentType.UK && "text-cyan-300",
        accent === AccentType.AU && "text-orange-300",
        className
      )}
    >
      {text}
    </div>
  );
};
