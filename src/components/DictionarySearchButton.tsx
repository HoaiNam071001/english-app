import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GraduationCap, Languages, School } from "lucide-react";

const DictionarySearchButton = ({ text, showText = false }) => {
  // Hàm xử lý mở cửa sổ popup (giữ nguyên logic tính toán vị trí)
  const openDictionaryPopup = (url) => {
    const popupWidth = 500;
    const popupHeight = 600;

    const dualScreenLeft =
      window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop =
      window.screenTop !== undefined ? window.screenTop : window.screenY;

    const width = window.innerWidth
      ? window.innerWidth
      : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width;
    const height = window.innerHeight
      ? window.innerHeight
      : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height;

    const left = Math.round(dualScreenLeft + (width - popupWidth) / 2);
    const top = Math.round(dualScreenTop + (height - popupHeight) / 2);

    window.open(
      url,
      "DictionaryPopup",
      `width=${popupWidth},height=${popupHeight},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  };

  const handleSelectDictionary = (type) => {
    const trimText = text?.trim().toLowerCase();
    if (!trimText) return;

    let url = "";

    if (type === "cambridge") {
      url = `https://dictionary.cambridge.org/search/direct/?datasetsearch=english&q=${encodeURIComponent(
        trimText
      )}`;
    } else if (type === "oxford") {
      url = `https://www.oxfordlearnersdictionaries.com/search/english/?q=${encodeURIComponent(
        trimText
      )}`;
    }

    if (url) {
      openDictionaryPopup(url);
    }
  };

  return (
    <Popover>
      {/* asChild giúp PopoverTrigger sử dụng trực tiếp phần tử con thay vì bọc thêm button */}
      <PopoverTrigger asChild>
        <div
          className="inline-flex items-center gap-1 p-1 rounded-full transition-all cursor-pointer hover:bg-accent hover:text-accent-foreground"
          onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click lan ra ngoài nếu nút này nằm trong một thẻ cha có onClick
          title="Tra từ điển"
        >
          <Languages size={14} />
          {showText && <div className="text-[12px]">{text}</div>}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-48 p-1" align="start">
        <div
          className="flex flex-col gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
            onClick={() => handleSelectDictionary("cambridge")}
          >
            <School className="h-4 w-4" />
            <span>Cambridge</span>
          </button>

          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
            onClick={() => handleSelectDictionary("oxford")}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Oxford</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DictionarySearchButton;
