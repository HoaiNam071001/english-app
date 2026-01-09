import { cn } from "@/lib/utils";

export const ImagePreview = ({
  url,
  w,
  h,
}: {
  url?: string;
  w?: string | number;
  h?: string | number;
}) => {
  return (
    <div
      style={{
        height: h,
        width: w,
      }}
      className={cn(
        "w-30 h-30 rounded border overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center",
        !h ? "h-30" : "",
        !w ? "w-30" : ""
      )}
    >
      {url ? (
        <img
          src={url}
          alt="preview"
          className={cn("h-full w-full object-cover")}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/40x40?text=Err";
          }}
        />
      ) : (
        <span className="text-[10px] text-muted-foreground">No img</span>
      )}
    </div>
  );
};
