import { cn } from "@/lib/utils";

interface BrowserFrameProps {
  src: string;
  alt: string;
  className?: string;
}

export const BrowserFrame = ({ src, alt, className }: BrowserFrameProps) => {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/5 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
      </div>
      <img src={src} alt={alt} className="w-full object-cover" loading="lazy" />
    </div>
  );
};

export const PhoneFrame = ({ src, alt, className }: BrowserFrameProps) => {
  return (
    <div
      className={cn(
        "relative w-fit rounded-[2.25rem] border-[6px] border-white/10 bg-white/5 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl",
        className
      )}
    >
      <div className="absolute left-1/2 top-3 z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-black/40" />
      <img
        src={src}
        alt={alt}
        className="w-56 rounded-[1.5rem] object-cover sm:w-64"
        loading="lazy"
      />
    </div>
  );
};
