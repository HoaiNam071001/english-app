import { CommonModal } from "@/components/CommonModal";
import { FolderInput } from "lucide-react";
import React, { useEffect, useState } from "react";
import TopicSelector from "./TopicSelector";

interface MoveTopicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (topicId: string | null) => void; // Sửa lại type null cho khớp state
}

const MoveTopicModal: React.FC<MoveTopicModalProps> = ({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
}) => {
  // Dùng null thay vì string | null để rõ ràng trạng thái ban đầu
  const [targetTopicId, setTargetTopicId] = useState<string | null>(null);

  // Reset state khi mở modal
  useEffect(() => {
    if (open) {
      setTargetTopicId(null);
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(targetTopicId);
    onOpenChange(false);
  };

  return (
    <CommonModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Assign Topic to ${selectedCount} words`}
      icon={<FolderInput size={20} className="text-blue-600" />}
      onConfirm={handleConfirm}
      confirmText="Assign"
      // disableConfirm={!targetTopicId} // Bật dòng này nếu bắt buộc phải chọn mới được bấm
    >
      <div className="space-y-3 py-2">
        <p className="text-sm text-muted-foreground">
          Select the topic you want to assign to the selected words:
        </p>
        <TopicSelector
          value={targetTopicId}
          onChange={setTargetTopicId}
          placeholder="-- Uncategorized --"
        />
      </div>
    </CommonModal>
  );
};

export default MoveTopicModal;
