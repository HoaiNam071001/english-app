import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TYPE_COLORS } from "@/constants";
import { useWordTypes } from "@/hooks/useWordTypes";
import { useMemo } from "react";

interface WordTypeIndicatorProps {
  typeIds?: string[];
}

export const WordTypeIndicator = ({ typeIds }: WordTypeIndicatorProps) => {
  const { getTypesByIds } = useWordTypes();

  const assignedTypes = useMemo(
    () => getTypesByIds(typeIds),
    [typeIds, getTypesByIds]
  );

  const gradientStyle = useMemo(() => {
    if (!assignedTypes?.length) return null;
    const getHex = (colorId: string) =>
      TYPE_COLORS.find((c) => c.id === colorId)?.hex || "#64748b";

    if (assignedTypes.length === 1) {
      return { backgroundColor: getHex(assignedTypes[0].color) };
    }

    const colors = assignedTypes.map((type) => getHex(type.color));

    return {
      // Không set % stops để màu tự blend vào nhau quanh tâm
      backgroundImage: `conic-gradient(${colors.join(", ")})`,
    };
  }, [assignedTypes]);

  if (!gradientStyle) return null;

  return (
    <div className="flex items-center justify-center opacity-80">
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            {/* Circle Container với Conic Gradient */}
            <div
              className="w-3 h-3 rounded-full shadow-sm ring-[1.5px] ring-white dark:ring-black/20 cursor-help transition-transform hover:scale-110"
              style={gradientStyle}
            />
          </TooltipTrigger>

          <TooltipContent side="right" className="p-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Assigned Types
              </span>
              {assignedTypes.map((type) => {
                const colorObj =
                  TYPE_COLORS.find((c) => c.id === type.color) ||
                  TYPE_COLORS[12];
                return (
                  <div
                    key={type.id}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div className={`w-2 h-2 rounded-full ${colorObj.bg}`} />
                    <span>{type.name}</span>
                  </div>
                );
              })}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
