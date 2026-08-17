import { Badge } from "@/components/ui/badge";
import {
  formatComboLabel,
  resolveEffectiveCombo,
  ShortcutBinding,
  ShortcutPageGroup,
} from "@/lib/shortcuts";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ShortcutGroupListProps {
  pageGroups: ShortcutPageGroup[];
  overrides: Record<string, string>;
  renderActions?: (binding: ShortcutBinding, groupLabel: string) => React.ReactNode;
}

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span
    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
      isActive
        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        : "bg-muted text-muted-foreground"
    }`}
  >
    {isActive ? "Đang mở" : "Chưa mở"}
  </span>
);

export const ShortcutGroupList: React.FC<ShortcutGroupListProps> = ({
  pageGroups,
  overrides,
  renderActions,
}) => {
  const [manual, setManual] = useState<Record<string, boolean>>({});

  const isExpanded = (key: string, defaultActive: boolean) =>
    manual[key] ?? defaultActive;

  const toggle = (key: string, defaultActive: boolean) =>
    setManual((prev) => ({ ...prev, [key]: !isExpanded(key, defaultActive) }));

  const renderBindingRow = (binding: ShortcutBinding, groupLabel: string) => {
    const effective = resolveEffectiveCombo(binding, overrides);
    const isCustom = overrides[binding.id] !== undefined;

    return (
      <div
        key={binding.id}
        className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-accent/40"
      >
        <span className="text-sm text-foreground">{binding.description}</span>
        <div className="flex items-center gap-2 shrink-0">
          {isCustom && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
              Tuỳ chỉnh
            </Badge>
          )}
          {effective === "" ? (
            <span className="text-xs text-muted-foreground italic">Đã tắt</span>
          ) : (
            <div className="flex items-center gap-1">
              {formatComboLabel(effective).map((k, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="font-mono text-[11px] px-1.5 py-0 h-5"
                >
                  {k}
                </Badge>
              ))}
            </div>
          )}
          {renderActions?.(binding, groupLabel)}
        </div>
      </div>
    );
  };

  if (pageGroups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Chưa có phím tắt nào khả dụng.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {pageGroups.map((page) => {
        const pageExpanded = isExpanded(page.key, page.isActive);
        return (
          <div key={page.key} className="border rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(page.key, page.isActive)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                {pageExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {page.page}
              </span>
              <StatusBadge isActive={page.isActive} />
            </button>

            {pageExpanded && (
              <div className="p-2 space-y-2">
                {page.directBindings.length > 0 && (
                  <div className="space-y-1">
                    {page.directBindings.map((b) => renderBindingRow(b, page.page))}
                  </div>
                )}

                {page.sections.map((section) => {
                  const sectionExpanded = isExpanded(section.key, section.isActive);
                  const groupLabel = `${page.page} · ${section.section}`;
                  return (
                    <div
                      key={section.key}
                      className="border rounded-md overflow-hidden ml-1"
                    >
                      <button
                        type="button"
                        onClick={() => toggle(section.key, section.isActive)}
                        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
                      >
                        <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          {sectionExpanded ? (
                            <ChevronDown size={12} />
                          ) : (
                            <ChevronRight size={12} />
                          )}
                          {section.section}
                        </span>
                        <StatusBadge isActive={section.isActive} />
                      </button>
                      {sectionExpanded && (
                        <div className="p-2 space-y-1">
                          {section.bindings.map((b) => renderBindingRow(b, groupLabel))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
