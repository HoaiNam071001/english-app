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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["home", "common"]);
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
          <Label className="mb-2 block">{t("wordTypes.selectTitle")}</Label>
          <WordTypeSelector value={selectedTypes} onChange={setSelectedTypes} />
          <p className="text-xs text-muted-foreground mt-2">
            {t("wordTypes.overwriteWarning")}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common:actions.cancel")}
          </Button>
          <Button
            onClick={() => {
              onConfirm(selectedTypes);
              onOpenChange(false);
            }}
          >
            {t("common:actions.apply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
