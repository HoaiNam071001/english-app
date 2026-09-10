import { cn } from "@/lib/utils";
import * as React from "react";

interface DualRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  /** [giá trị đầu dưới, giá trị đầu trên] */
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (value: number) => string;
  className?: string;
}

// Slider kéo 2 đầu (min & max), dựng từ 2 <input type="range"> chồng lên nhau -
// dự án chưa có Radix Slider nên dùng cách chuẩn này thay vì thêm dependency mới.
export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatLabel,
  className,
}) => {
  const [lo, hi] = value;
  const range = Math.max(step, max - min);
  const loPct = ((lo - min) / range) * 100;
  const hiPct = ((hi - min) / range) * 100;

  const handleLoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange([Math.min(Number(e.target.value), hi), hi]);
  };
  const handleHiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange([lo, Math.max(Number(e.target.value), lo)]);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-5 flex items-center">
        {/* Track nền */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-muted" />
        {/* Đoạn đang được chọn */}
        <div
          className="absolute h-1.5 rounded-full bg-primary"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          aria-label="range-start"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={handleLoChange}
          className="range-thumb-only absolute inset-x-0 w-full h-5 m-0 cursor-pointer"
        />
        <input
          type="range"
          aria-label="range-end"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={handleHiChange}
          className="range-thumb-only absolute inset-x-0 w-full h-5 m-0 cursor-pointer"
        />
      </div>
      {formatLabel && (
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>{formatLabel(lo)}</span>
          <span>{formatLabel(hi)}</span>
        </div>
      )}
    </div>
  );
};
