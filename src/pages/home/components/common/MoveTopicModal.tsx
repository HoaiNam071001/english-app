import { CommonModal } from "@/components/CommonModal";
import { FolderInput } from "lucide-react";
import React, { useEffect, useState } from "react";
import TopicSelector from "./TopicSelector";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["home", "common"]);
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
      confirmText={t("topics.assign")}
      // disableConfirm={!targetTopicId} // Bật dòng này nếu bắt buộc phải chọn mới được bấm
    >
      <div className="space-y-3 py-2">
        <p className="text-sm text-muted-foreground">
          {t("topics.assignDescription")}
        </p>
        <TopicSelector
          value={targetTopicId}
          onChange={setTargetTopicId}
          placeholder={t("topics.uncategorizedOption")}
        />
      </div>
    </CommonModal>
  );
};

export default MoveTopicModal;
