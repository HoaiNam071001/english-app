import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { JSX, useEffect, useRef, useState } from "react";

interface ExpandableTextProps {
  content: string | JSX.Element;
  maxHeight?: number; // Mặc định 100px
}

export const ExpandableText = ({
  content,
  maxHeight = 100,
}: ExpandableTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      setIsOverflowing(textRef.current.scrollHeight > maxHeight);
    }
  }, [content, maxHeight]);

  return (
    <div className="relative">
      <div
        className={`text-sm text-muted-foreground transition-all duration-300 ease-in-out ${
          isExpanded ? "" : "overflow-hidden"
        }`}
        style={{
          maxHeight: isExpanded ? "none" : `${maxHeight}px`,
          // Nếu collapsed thì thêm mask mờ ở dưới cho đẹp
          maskImage:
            !isExpanded && isOverflowing
              ? "linear-gradient(to bottom, black 60%, transparent 100%)"
              : "none",
        }}
      >
        <p ref={textRef} className="whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      </div>

      {isOverflowing && (
        <div
          className={`mt-2 ${
            !isExpanded
              ? "absolute -bottom-6 left-0 right-0 flex justify-center"
              : ""
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Tránh click nhầm vào card
              setIsExpanded(!isExpanded);
            }}
            className="h-6 text-xs text-primary hover:bg-transparent hover:underline px-0"
          >
            {isExpanded ? (
              <span className="flex items-center gap-1">
                Thu gọn <ChevronUp size={12} />
              </span>
            ) : (
              <span className="flex items-center gap-1">
                Xem thêm <ChevronDown size={12} />
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
