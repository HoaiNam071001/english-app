import { useToast } from "@/hooks/useToast";
import { useEffect, useState } from "react";

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

  // Đồng bộ tempUrl khi prop url từ bên ngoài thay đổi
  useEffect(() => {
    setTempUrl(url);
  }, [url]);

  // Logic Debounce: Đợi người dùng dừng gõ 1s rồi mới apply
  useEffect(() => {
    // Nếu giá trị không đổi so với ảnh hiện tại thì không làm gì
    if (tempUrl === url) return;

    const handler = setTimeout(() => {
      const trimmedUrl = tempUrl.trim();

      // Kiểm tra định dạng Base64
      const isBase64 = /^data:image\/[a-z]+;base64,/.test(trimmedUrl);

      if (isBase64) {
        toast.error(
          "Base64 format is not allowed. Please use a direct image URL."
        );
        setTempUrl(url); // Reset về URL cũ nếu lỗi
        return;
      }

      onApply(trimmedUrl);
    }, 500); // 1000ms = 1s

    // Cleanup function: Xóa timer nếu người dùng tiếp tục gõ trước khi hết 1s
    return () => clearTimeout(handler);
  }, [tempUrl, url, onApply, toast]);

  return (
    <div
      className="relative w-28 h-28 rounded-md border bg-muted overflow-hidden group shadow-sm flex-shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
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
        />

        {/* Chỉ báo trạng thái đang chờ xử lý (Optional) */}
        <div className="text-[8px] text-gray-400 text-right italic">
          Auto-applying...
        </div>
      </div>
    </div>
  );
};
