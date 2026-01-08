export const ImagePreview = ({ url }: { url?: string }) => {
  return (
    <div className="w-30 h-30 rounded border overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
      {url ? (
        <img 
          src={url} 
          alt="preview" 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/40x40?text=Err";
          }}
        />
      ) : (
        <span className="text-[10px] text-muted-foreground">No img</span>
      )}
    </div>
  );
};