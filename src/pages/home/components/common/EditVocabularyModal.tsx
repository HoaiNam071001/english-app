import { CommonModal } from "@/components/CommonModal";
import { VocabularyItem } from "@/types";
import React from "react";
import { EditPopoverContent } from "../EditPopoverContent";

interface EditVocabularyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word: VocabularyItem;
  onSave: (id: string, updates: Partial<VocabularyItem>) => void;
  onDelete: (id: string) => void;
}

export const EditVocabularyModal: React.FC<EditVocabularyModalProps> = ({
  open,
  onOpenChange,
  word,
  onSave,
  onDelete,
}) => {
  return (
    <CommonModal
      open={open}
      onOpenChange={onOpenChange}
      title={<span className="font-bold text-lg">Edit</span>}
      footer={<></>}
    >
      <div className="w-full">
        <EditPopoverContent
          word={word}
          onSave={onSave}
          onDelete={onDelete}
          onClose={() => onOpenChange(false)}
        />
      </div>
    </CommonModal>
  );
};
