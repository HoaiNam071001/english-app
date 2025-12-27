import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FolderInput } from "lucide-react";
import React, { useEffect, useState } from "react";
import TopicSelector from "./TopicSelector";

interface MoveTopicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (topicId: string | undefined) => void;
}

const MoveTopicModal: React.FC<MoveTopicModalProps> = ({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
}) => {
  const [targetTopicId, setTargetTopicId] = useState<string>(null);

  // Reset state khi mở modal
  useEffect(() => {
    if (open) {
      setTargetTopicId(null);
    }
  }, [open]);

  const handleConfirm = () => {
    const finalTopicId = targetTopicId;
    onConfirm(finalTopicId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderInput size={20} className="text-blue-600" />
            Assign Topic to {selectedCount} words
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Select the topic you want to assign to the selected words:
          </p>
          <TopicSelector
            value={targetTopicId}
            onChange={setTargetTopicId}
            placeholder="-- Uncategorized --"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveTopicModal;
