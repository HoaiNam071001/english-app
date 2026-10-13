import { CommonModal } from "@/components/CommonModal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { TopicItem, VocabularyItem } from "@/types";
import { Info, ListPlus, SquareArrowOutUpRight } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { VocabularyDetailContent } from "../VocabularyDetailContent";
import { VocabLinkContext, VocabLinkContextValue } from "./context";
import { buildMatchEntries } from "./matchVocab";

interface VocabLinkProviderProps {
  words: VocabularyItem[];
  topics: TopicItem[];
  onCreateWord?: (text: string) => void;
  onAddToSession?: (item: VocabularyItem) => void;
  onOpenInVocabulary?: (item: VocabularyItem) => void;
  children: React.ReactNode;
}

/** Cấp bộ từ cho InteractiveText để highlight từ đã có, và giữ modal xem chi tiết dùng chung. */
export const VocabLinkProvider: React.FC<VocabLinkProviderProps> = ({
  words,
  topics,
  onCreateWord,
  onAddToSession,
  onOpenInVocabulary,
  children,
}) => {
  const { t } = useTranslation("home");
  const toast = useToast();
  const [viewingId, setViewingId] = useState<string | null>(null);

  const entries = useMemo(() => buildMatchEntries(words), [words]);

  // Lấy bản mới nhất từ danh sách để modal luôn đúng dữ liệu sau khi từ được cập nhật
  const viewingItem = viewingId
    ? words.find((w) => w.id === viewingId)
    : undefined;

  const value = useMemo<VocabLinkContextValue>(
    () => ({
      entries,
      viewWord: (item) => setViewingId(item.id ?? null),
      createWord: onCreateWord,
    }),
    [entries, onCreateWord],
  );

  return (
    <VocabLinkContext.Provider value={value}>
      {children}
      <CommonModal
        open={!!viewingItem}
        onOpenChange={(open) => !open && setViewingId(null)}
        title={t("detail.title")}
        icon={<Info size={18} />}
        footer={
          viewingItem && (onAddToSession || onOpenInVocabulary) ? (
            <DialogFooter className="gap-2">
              {onAddToSession && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    onAddToSession(viewingItem);
                    toast.success(
                      t("textLink.addedToSession", { word: viewingItem.text }),
                    );
                  }}
                >
                  <ListPlus size={14} /> {t("review.addToSession")}
                </Button>
              )}
              {onOpenInVocabulary && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    onOpenInVocabulary(viewingItem);
                    setViewingId(null);
                  }}
                >
                  <SquareArrowOutUpRight size={14} />{" "}
                  {t("review.openInVocabulary")}
                </Button>
              )}
            </DialogFooter>
          ) : null
        }
      >
        {viewingItem && (
          <VocabularyDetailContent
            item={viewingItem}
            topic={topics.find((tp) => tp.id === viewingItem.topicId)}
          />
        )}
      </CommonModal>
    </VocabLinkContext.Provider>
  );
};
