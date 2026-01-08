import { useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/useToast";

export const ImageIllustration = ({
  url,
  onApply,
}: {
  url: string;
  onApply: (newUrl: string) => void;
}) => {
  const [tempUrl, setTempUrl] = useState(url);
  const [isHovered, setIsHovered] = useState(false);
  const toast = useToast();

  const handleApply = () => {
    const trimmedUrl = tempUrl.trim();

    // Kiểm tra định dạng Base64
    const isBase64 = /^data:image\/[a-z]+;base64,/.test(trimmedUrl);

    if (isBase64) {
      setTempUrl(url);
      toast.error(
        "Base64 format is not allowed. Please use a direct image URL."
      );
      return;
    }

    // Nếu để trống thì có thể hiểu là muốn xóa ảnh
    onApply(trimmedUrl);
  };

  return (
    <div
      className="relative w-28 h-28 rounded-md border bg-muted overflow-hidden group shadow-sm flex-shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        // Reset nội dung textarea về URL hiện tại nếu chưa bấm Apply
        setTempUrl(url);
      }}
    >
      {/* Background Image Preview */}
      {url ? (
        <img src={url} alt="preview" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground italic p-2 text-center bg-muted/50">
          No image
        </div>
      )}

      {/* Overlay Edit - Chỉ hiện khi Hover */}
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity duration-200 flex flex-col p-2 gap-2 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <textarea
          className="flex-1 w-full bg-transparent text-[10px] text-white outline-none resize-none leading-tight border-none p-0 placeholder:text-gray-500 custom-scrollbar"
          placeholder="Paste URL here..."
          value={tempUrl}
          onChange={(e) => setTempUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleApply();
            }
          }}
        />

        <Button
          size="sm"
          className="h-5 w-full text-[9px] font-bold bg-blue-600 hover:bg-blue-500 text-white border-none"
          onClick={handleApply}
        >
          APPLY
        </Button>
      </div>
    </div>
  );
};
