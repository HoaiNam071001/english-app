/* eslint-disable react-refresh/only-export-components */
import { SimpleTooltip } from "@/components/SimpleTooltip";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export enum LearningStatus {
  All = "all",
  Learned = "learned",
  NotLearned = "not-learned",
}

export enum SharingStatus {
  All = "all",
  Shared = "shared",
  Private = "private",
}

export enum PinStatus {
  All = "all",
  Pinned = "pinned",
  NotPinned = "not-pinned",
}

export enum FilterOperator {
  OR = "OR",
  AND = "AND",
}

export interface FilterState {
  typeIds: string[];
  learningStatus: LearningStatus;
  sharingStatus: SharingStatus;
  pinStatus: PinStatus;
  operator: FilterOperator;
}

export const DEFAULT_FILTER: FilterState = {
  typeIds: [],
  learningStatus: LearningStatus.All,
  sharingStatus: SharingStatus.All,
  pinStatus: PinStatus.All,
  operator: FilterOperator.OR,
};

interface FilterOptionRowProps<T extends string> {
  label: string;
  value: T;
  onChange: (val: T) => void;
  options: {
    value: T;
    icon: React.ReactNode;
    tooltip: string;
  }[];
}

export const FilterOptionRow = <T extends string>({
  label,
  value,
  onChange,
  options,
}: FilterOptionRowProps<T>) => {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-1 bg-muted/50 p-1 rounded-md border border-border/50">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <SimpleTooltip content={opt.tooltip} key={opt.value}>
              <button
                onClick={() => onChange(opt.value)}
                className={cn(
                  "flex-1 flex items-center justify-center h-7 rounded-sm transition-all text-muted-foreground hover:text-foreground hover:bg-background/50",
                  isActive &&
                    "bg-background text-primary shadow-sm ring-1 ring-border font-medium"
                )}
              >
                {opt.icon}
              </button>
            </SimpleTooltip>
          );
        })}
      </div>
    </div>
  );
};
