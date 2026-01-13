import { Search } from "lucide-react";

const CambridgeSearchButton = ({ text, showText = false }) => {
  const handlePopupSearch = (e) => {
    e.stopPropagation();
    const trimText = text?.trim()?.replace(/\s+/g, '-');

    if (!trimText) return;

    const url = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(
      trimText
    )}`;

    const popupWidth = 500;
    const popupHeight = 600;

    // 1. Lấy tọa độ gốc của cửa sổ trình duyệt hiện tại (xử lý đa màn hình)
    const dualScreenLeft =
      window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop =
      window.screenTop !== undefined ? window.screenTop : window.screenY;

    // 2. Lấy kích thước trình duyệt hiện tại (dùng outerWidth để tính cả thanh cuộn/viền)
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
      "CambridgeDictionaryPopup",
      `width=${popupWidth},height=${popupHeight},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  };

  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-full transition-all cursor-pointer hover:bg-background hover:text-blue-500"
      onClick={handlePopupSearch}
      title={"Open Cambridge Popup"}
    >
      <Search size={14} />
      {showText && <div className="text-[12px]">{text}</div>}
    </div>
  );
};

export default CambridgeSearchButton;
