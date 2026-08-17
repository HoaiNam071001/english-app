import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShortcutsPanel } from "@/contexts/ShortcutsContext";
import {
  buildPageGroups,
  combosEqual,
  comboToTokens,
  flattenPageGroups,
  formatComboLabel,
  KEY_OPTION_GROUPS,
  resolveEffectiveCombo,
  ShortcutBinding,
  tokensToCombo,
  validateComboTokens,
} from "@/lib/shortcuts";
import { STATIC_SHORTCUT_CATALOG } from "@/lib/shortcutRegistry";
import { AlertTriangle, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

interface ConflictInfo {
  id: string;
  description: string;
  groupLabel: string;
}

interface ShortcutEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  binding: ShortcutBinding | null;
  groupLabel: string;
}

export const ShortcutEditorDialog: React.FC<ShortcutEditorDialogProps> = ({
  open,
  onOpenChange,
  binding,
  groupLabel,
}) => {
  const { catalog, overrides, setOverride } = useShortcutsPanel();
  const { t } = useTranslation("shortcuts");
  const [slots, setSlots] = useState<string[]>([]);
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);

  const flatBindings = useMemo(
    () => flattenPageGroups(buildPageGroups(catalog, STATIC_SHORTCUT_CATALOG)),
    [catalog]
  );

  useEffect(() => {
    if (!open || !binding) return;
    const current = resolveEffectiveCombo(binding, overrides);
    setSlots(comboToTokens(current));
    setConflict(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, binding?.id]);

  if (!binding) return null;

  const validation = validateComboTokens(slots);
  const previewCombo = tokensToCombo(slots.filter(Boolean));

  const updateSlot = (index: number, value: string) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addSlot = () =>
    setSlots((prev) => (prev.length < 4 ? [...prev, ""] : prev));

  const removeSlot = (index: number) =>
    setSlots((prev) => prev.filter((_, i) => i !== index));

  const findConflict = (combo: string): ConflictInfo | null => {
    for (const { binding: b, groupLabel } of flatBindings) {
      if (b.displayOnly || b.id === binding.id) continue;
      const effective = resolveEffectiveCombo(b, overrides);
      if (effective && combosEqual(effective, combo)) {
        return { id: b.id, description: b.description, groupLabel };
      }
    }
    return null;
  };

  const handleSaveClick = () => {
    if (validation.level === "error") return;
    const combo = tokensToCombo(slots.filter(Boolean));
    const found = findConflict(combo);
    if (found) {
      setConflict(found);
      return;
    }
    setOverride(binding.id, combo);
    onOpenChange(false);
  };

  const handleOverrideConfirm = () => {
    if (!conflict) return;
    const combo = tokensToCombo(slots.filter(Boolean));
    setOverride(conflict.id, "");
    setOverride(binding.id, combo);
    setConflict(null);
    onOpenChange(false);
  };

  const handleResetDefault = () => {
    setOverride(binding.id, null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !conflict} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>{t("editor.title")}</DialogTitle>
            <DialogDescription>
              {groupLabel} · {t(binding.description)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {slots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <Select value={slot || undefined} onValueChange={(v) => updateSlot(idx, v)}>
                    <SelectTrigger size="sm" className="w-32">
                      <SelectValue placeholder={t("editor.selectKey")} />
                    </SelectTrigger>
                    <SelectContent>
                      {KEY_OPTION_GROUPS.map((g) => (
                        <SelectGroup key={g.group}>
                          <SelectLabel>{t(g.group)}</SelectLabel>
                          {g.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSlot(idx)}
                    title={t("editor.removeKey")}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}

              {slots.length < 4 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={addSlot}
                >
                  <Plus size={14} /> {t("editor.addKey")}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
              <span className="text-xs text-muted-foreground">
                {t("editor.preview")}
              </span>
              {slots.filter(Boolean).length === 0 ? (
                <span className="text-xs text-muted-foreground italic">
                  {t("editor.previewEmpty")}
                </span>
              ) : (
                formatComboLabel(previewCombo).map((k, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="font-mono text-[11px] px-1.5 py-0 h-5"
                  >
                    {k}
                  </Badge>
                ))
              )}
            </div>

            {validation.level !== "ok" && (
              <p
                className={`text-xs flex items-start gap-1.5 ${
                  validation.level === "error" ? "text-destructive" : "text-orange-500"
                }`}
              >
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                {validation.messageKey && t(validation.messageKey)}
              </p>
            )}
          </div>

          <DialogFooter className="sm:justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetDefault}
              className="text-muted-foreground"
            >
              {t("editor.resetDefault")}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("common:actions.cancel")}
              </Button>
              <Button onClick={handleSaveClick} disabled={validation.level === "error"}>
                {t("common:actions.save")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!conflict} onOpenChange={(o) => !o && setConflict(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />{" "}
              {t("editor.conflictTitle")}
            </DialogTitle>
            <DialogDescription className="pt-1">
              <Trans
                ns="shortcuts"
                i18nKey="editor.conflictDescription"
                values={{
                  description: conflict ? t(conflict.description) : "",
                  group: conflict?.groupLabel ?? "",
                }}
                components={[<strong className="text-foreground" />]}
              />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConflict(null)}>
              {t("editor.conflictEdit")}
            </Button>
            <Button variant="destructive" onClick={handleOverrideConfirm}>
              {t("editor.conflictOverride")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
