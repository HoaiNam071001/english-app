import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import WordTypeSelector from "../common/WordTypeSelector";

interface BulkAssignTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (typeIds: string[]) => void;
}

export const BulkAssignTypeModal: React.FC<BulkAssignTypeModalProps> = ({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  useEffect(() => {
    if (open) setSelectedTypes([]);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Types to {selectedCount} items</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label className="mb-2 block">Select Word Types</Label>
          <WordTypeSelector value={selectedTypes} onChange={setSelectedTypes} />
          <p className="text-xs text-muted-foreground mt-2">
            Warning: This will overwrite existing types.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(selectedTypes);
              onOpenChange(false);
            }}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
