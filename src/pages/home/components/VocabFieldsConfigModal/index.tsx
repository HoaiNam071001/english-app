import { CommonModal } from "@/components/CommonModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useVocabFieldsConfig } from "@/contexts/VocabFieldsConfigContext";
import {
  DEFAULT_VOCAB_FIELDS_CONFIG,
  VocabFieldsConfig,
  VOCAB_FIELD_KEYS,
} from "@/types";
import { RotateCcw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const FIELD_LABEL_KEYS: Record<keyof VocabFieldsConfig, string> = {
  meaning: "edit.meaning",
  partOfSpeech: "edit.partOfSpeech",
  wordTypes: "edit.wordTypes",
  phonetics: "edit.phonetics",
  topic: "edit.topic",
  note: "edit.note",
  image: "create.fieldsConfig.image",
};

interface VocabFieldsConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VocabFieldsConfigModal: React.FC<
  VocabFieldsConfigModalProps
> = ({ open, onOpenChange }) => {
  const { t } = useTranslation(["home", "common"]);
  const { config, setConfig } = useVocabFieldsConfig();
  const [draft, setDraft] = useState<VocabFieldsConfig>(config);

  useEffect(() => {
    if (open) setDraft(config);
  }, [open, config]);

  const handleConfirm = () => {
    setConfig(draft);
    onOpenChange(false);
  };

  const handleReset = () => setDraft(DEFAULT_VOCAB_FIELDS_CONFIG);

  return (
    <CommonModal
      open={open}
      onOpenChange={onOpenChange}
      title={t("create.fieldsConfig.title")}
      description={t("create.fieldsConfig.description")}
      onConfirm={handleConfirm}
      confirmText={t("common:actions.save")}
      contentClassName="w-full md:w-[360px]"
    >
      <div className="space-y-1">
        <div className="flex justify-start px-1 pb-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleReset}
          >
            <RotateCcw size={12} /> {t("create.fieldsConfig.reset")}
          </Button>
        </div>

        <div className="flex items-center gap-2 px-1 py-1.5 opacity-70">
          <Checkbox checked disabled className="h-4 w-4" />
          <Label className="text-sm font-normal">
            {t("create.fieldsConfig.wordAlwaysOn")}
          </Label>
        </div>

        {VOCAB_FIELD_KEYS.map((key) => (
          <div key={key} className="flex items-center gap-2 px-1 py-1.5">
            <Checkbox
              id={`vocab-field-${key}`}
              checked={draft[key]}
              onCheckedChange={(checked) =>
                setDraft((prev) => ({ ...prev, [key]: !!checked }))
              }
              className="h-4 w-4"
            />
            <Label
              htmlFor={`vocab-field-${key}`}
              className="text-sm font-normal cursor-pointer"
            >
              {t(FIELD_LABEL_KEYS[key])}
            </Label>
          </div>
        ))}
      </div>
    </CommonModal>
  );
};
