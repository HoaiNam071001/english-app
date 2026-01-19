import { X } from "lucide-react";

export const CardBack: React.FC<{
  handleRemove: (e: React.MouseEvent) => void;
}> = ({ handleRemove }) => {
  return (
    <div className="flex flex-col items-center justify-center relative w-full h-full animate-in fade-in zoom-in-95 duration-500">
      <div className="absolute inset-0 opacity-15 dark:opacity-25">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:16px_16px]"></div>
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(168,85,247,0.15)_60deg,transparent_120deg,rgba(99,102,241,0.15)_180deg,transparent_240deg,rgba(59,130,246,0.15)_300deg,transparent_360deg)]"></div>
        <div className="absolute inset-0 bg-[repeating-linear-gradient(30deg,transparent,transparent_10px,rgba(168,85,247,0.1)_10px,rgba(168,85,247,0.1)_11px)]"></div>
      </div>

      <div className="absolute top-2 left-2 w-8 h-8 border-2 border-purple-400/30 rotate-45"></div>
      <div className="absolute top-4 right-3 w-6 h-6 border-2 border-indigo-400/30 rounded-full"></div>
      <div className="absolute bottom-3 left-4 w-5 h-5 border-2 border-blue-400/30 rotate-45"></div>
      <div className="absolute bottom-2 right-2 w-7 h-7 border-2 border-purple-400/30 rounded-full"></div>

      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-purple-400/40"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-indigo-400/40"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-blue-400/40"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-purple-400/40"></div>

      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-indigo-500/15 to-blue-500/15 dark:from-purple-400/25 dark:via-indigo-400/25 dark:to-blue-400/25 blur-xl"></div>

      <div
        className="absolute top-0 left-0 p-1.5 rounded-full hover:bg-white/20 dark:hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100 text-white/70 hover:text-red-300 dark:hover:text-red-400 z-20 backdrop-blur-sm"
        onClick={handleRemove}
        title="Remove"
      >
        <X size={16} />
      </div>

      <div className="relative z-10 flex items-center justify-center">
        <div className="text-white/95 dark:text-white font-bold text-6xl select-none drop-shadow-[0_0_12px_rgba(168,85,247,0.7)] dark:drop-shadow-[0_0_15px_rgba(196,181,253,0.8)]">
          ?
        </div>
        <div className="absolute inset-0 text-white/30 dark:text-purple-300/30 font-bold text-6xl select-none blur-lg">
          ?
        </div>
      </div>

      <p className="text-white/85 dark:text-purple-200 text-[10px] mt-5 uppercase tracking-[0.2em] font-semibold z-10 drop-shadow-lg">
        Tap to reveal
      </p>

      <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-white/70 rounded-full"></div>
      <div className="absolute bottom-4 left-3 w-1 h-1 bg-purple-300/70 rounded-full"></div>
      <div className="absolute top-1/2 right-4 w-1 h-1 bg-blue-300/70 rounded-full"></div>
      <div className="absolute top-1/3 left-2 w-1.5 h-1.5 bg-indigo-300/70 rounded-full"></div>
      <div className="absolute bottom-1/3 right-2 w-1 h-1 bg-purple-200/70 rounded-full"></div>
    </div>
  );
};
