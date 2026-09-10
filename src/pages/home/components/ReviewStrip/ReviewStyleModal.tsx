import { CommonModal } from "@/components/CommonModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TOPIC_COLORS } from "@/constants";
import { cn } from "@/lib/utils";
import {
  DEFAULT_REVIEW_CARD_STYLE,
  REVIEW_DETAIL_FIELDS_MAX,
  ReviewCardDetailField,
  ReviewCardStyle,
  ReviewColorMode,
} from "@/types";
import { Check, RotateCcw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface ReviewStyleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  style: ReviewCardStyle;
  onSave: (style: ReviewCardStyle) => void;
}

const COLOR_MODES: ReviewColorMode[] = ["random", "topic", "custom"];

const DETAIL_FIELDS: ReviewCardDetailField[] = [
  "meaning",
  "phonetics",
  "partOfSpeech",
  "wordTypes",
  "topic",
];

export const ReviewStyleModal: React.FC<ReviewStyleModalProps> = ({
  open,
  onOpenChange,
  style,
  onSave,
}) => {
  const { t } = useTranslation(["home", "common"]);
  const [draft, setDraft] = useState<ReviewCardStyle>(style);

  useEffect(() => {
    if (open) setDraft(style);
  }, [open, style]);

  const toggleColorId = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      customColorIds: prev.customColorIds.includes(id)
        ? prev.customColorIds.filter((c) => c !== id)
        : [...prev.customColorIds, id],
    }));
  };

  const toggleDetailField = (field: ReviewCardDetailField) => {
    setDraft((prev) => {
      const has = prev.detailFields.includes(field);
      if (has) {
        return {
          ...prev,
          detailFields: prev.detailFields.filter((f) => f !== field),
        };
      }
      if (prev.detailFields.length >= REVIEW_DETAIL_FIELDS_MAX) return prev;
      return { ...prev, detailFields: [...prev.detailFields, field] };
    });
  };

  const handleReset = () => setDraft(DEFAULT_REVIEW_CARD_STYLE);

  const handleConfirm = () => {
    onSave(draft);
    onOpenChange(false);
  };

  return (
    <CommonModal
      open={open}
      onOpenChange={onOpenChange}
      title={t("review.style.title")}
      description={t("review.style.description")}
      onConfirm={handleConfirm}
      confirmText={t("common:actions.save")}
      contentClassName="w-full max-h-[75vh] overflow-y-auto"
    >
      <div className="space-y-4">
        <div className="flex justify-start px-1 pb-1">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 h-6 px-2 text-xs text-muted-foreground hover:text-foreground rounded-sm hover:bg-accent transition-colors"
          >
            <RotateCcw size={12} /> {t("review.filter.reset")}
          </button>
        </div>

        {/* --- MÀU NỀN CARD (khi từ chưa có ảnh) --- */}
        <div className="space-y-1.5">
          <Label className="text-xs">{t("review.style.colorMode")}</Label>
          <div className="flex items-center bg-muted/50 rounded-md p-0.5 border w-fit">
            {COLOR_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, colorMode: mode }))}
                className={cn(
                  "px-2.5 h-7 rounded text-xs font-medium transition-colors",
                  draft.colorMode === mode
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`review.style.colorMode_${mode}`)}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {t(`review.style.colorModeHint_${draft.colorMode}`)}
          </p>

          {draft.colorMode === "custom" && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {TOPIC_COLORS.map((c) => {
                const isSelected = draft.customColorIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleColorId(c.id)}
                    title={c.id}
                    className={cn(
                      "relative w-7 h-7 rounded-full border-2 transition-transform",
                      c.bg,
                      isSelected
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105",
                    )}
                  >
                    {isSelected && (
                      <Check
                        size={13}
                        className={cn("absolute inset-0 m-auto", c.text)}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* --- ẢNH MINH HOẠ --- */}
        <div className="flex items-center gap-2 px-1 py-1.5">
          <Checkbox
            id="review-style-image"
            checked={draft.showImage}
            onCheckedChange={(checked) =>
              setDraft((prev) => ({ ...prev, showImage: !!checked }))
            }
            className="h-4 w-4"
          />
          <Label
            htmlFor="review-style-image"
            className="text-sm font-normal cursor-pointer"
          >
            {t("review.style.showImage")}
          </Label>
        </div>

        {/* --- FIELD THÔNG TIN PHỤ (tối đa N) --- */}
        <div className="space-y-1">
          <Label className="text-xs">
            {t("review.style.detailFields", {
              count: draft.detailFields.length,
              max: REVIEW_DETAIL_FIELDS_MAX,
            })}
          </Label>
          {DETAIL_FIELDS.map((field) => {
            const checked = draft.detailFields.includes(field);
            const disabled =
              !checked && draft.detailFields.length >= REVIEW_DETAIL_FIELDS_MAX;
            return (
              <div
                key={field}
                className={cn(
                  "flex items-center gap-2 px-1 py-1.5",
                  disabled && "opacity-40",
                )}
              >
                <Checkbox
                  id={`review-style-field-${field}`}
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => toggleDetailField(field)}
                  className="h-4 w-4"
                />
                <Label
                  htmlFor={`review-style-field-${field}`}
                  className={cn(
                    "text-sm font-normal",
                    !disabled && "cursor-pointer",
                  )}
                >
                  {t(`review.style.field_${field}`)}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    </CommonModal>
  );
};
