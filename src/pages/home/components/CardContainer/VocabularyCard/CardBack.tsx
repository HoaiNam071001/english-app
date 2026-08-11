import { X } from "lucide-react";

export const CardBack: React.FC<{
  handleRemove: (e: React.MouseEvent) => void;
}> = ({ handleRemove }) => {
  return (
    <div className="flex flex-col items-center justify-center relative w-full h-full animate-in fade-in zoom-in-95 duration-500">
      <div className="absolute inset-0 opacity-15 dark:opacity-25">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:16px_16px]"></div>
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(253,230,138,0.3)_60deg,transparent_120deg,rgba(251,191,36,0.2)_180deg,transparent_240deg,rgba(249,115,22,0.2)_300deg,transparent_360deg)]"></div>
        <div className="absolute inset-0 bg-[repeating-linear-gradient(30deg,transparent,transparent_10px,rgba(255,251,235,0.16)_10px,rgba(255,251,235,0.16)_11px)]"></div>
      </div>

      <div className="absolute top-2 left-2 w-8 h-8 border-2 border-yellow-100/40 rotate-45"></div>
      <div className="absolute top-4 right-3 w-6 h-6 border-2 border-amber-100/40 rounded-full"></div>
      <div className="absolute bottom-3 left-4 w-5 h-5 border-2 border-orange-100/40 rotate-45"></div>
      <div className="absolute bottom-2 right-2 w-7 h-7 border-2 border-yellow-100/40 rounded-full"></div>

      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-yellow-100/50"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-100/50"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-orange-100/50"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-yellow-100/50"></div>

      <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 via-amber-200/20 to-orange-200/20 dark:from-yellow-300/20 dark:via-amber-300/20 dark:to-orange-300/20 blur-xl"></div>

      <div
        className="absolute top-0 left-0 p-1.5 rounded-full hover:bg-white/20 dark:hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100 text-white/70 hover:text-red-300 dark:hover:text-red-400 z-20 backdrop-blur-sm"
        onClick={handleRemove}
        title="Remove"
      >
        <X size={16} />
      </div>

      <div className="relative z-10 flex items-center justify-center">
        <div className="text-white/95 dark:text-white font-bold text-6xl select-none drop-shadow-[0_0_12px_rgba(154,52,18,0.35)] dark:drop-shadow-[0_0_15px_rgba(254,215,170,0.55)]">
          ?
        </div>
        <div className="absolute inset-0 text-white/30 dark:text-amber-100/30 font-bold text-6xl select-none blur-lg">
          ?
        </div>
      </div>

      <p className="text-white/90 dark:text-amber-50 text-[10px] mt-5 uppercase tracking-[0.2em] font-semibold z-10 drop-shadow-lg">
        Tap to reveal
      </p>

      <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-white/70 rounded-full"></div>
      <div className="absolute bottom-4 left-3 w-1 h-1 bg-yellow-100/80 rounded-full"></div>
      <div className="absolute top-1/2 right-4 w-1 h-1 bg-orange-100/80 rounded-full"></div>
      <div className="absolute top-1/3 left-2 w-1.5 h-1.5 bg-amber-100/80 rounded-full"></div>
      <div className="absolute bottom-1/3 right-2 w-1 h-1 bg-yellow-50/80 rounded-full"></div>
    </div>
  );
};
