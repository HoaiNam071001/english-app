import React from "react";
import { VocabularyItem, TopicItem } from "@/types";
import { Check, X, Calendar, BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import moment from "moment";
import { DisplayText } from "@/components/DisplayText";

interface VocabularyDetailContentProps {
  item: VocabularyItem;
  topic?: TopicItem;
}

export const VocabularyDetailContent: React.FC<
  VocabularyDetailContentProps
> = ({ item, topic }) => {
  const formatDate = (timestamp: number) => {
    return moment(timestamp).format("hh:mm DD/MM/YYYY");
  };

  const badgeBaseClass =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  return (
    <div className="space-y-4">
      {/* Header: Text & Status */}
      <div>
        <div className="text-lg font-bold text-primary">{item.text}</div>
        {topic && (
          // Thay thế Badge variant="outline"
          <span
            className={`${badgeBaseClass} mt-1 h-5 text-foreground border-border`}
          >
            {topic.label}
          </span>
        )}
      </div>

      <Separator />

      {/* Meaning & Example */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
            <BookOpen size={14} /> Meaning
            <div className="ml-auto flex items-center gap-1 whitespace-nowrap">
              {item.isLearned ? (
                // Thay thế Badge custom màu xanh (Learned)
                <span
                  className={`${badgeBaseClass} border-transparent bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400`}
                >
                  <Check size={12} className="mr-1" /> Learned
                </span>
              ) : (
                // Thay thế Badge variant="secondary" (Not learned)
                <span
                  className={`${badgeBaseClass} border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80`}
                >
                  <X size={12} className="mr-1" /> Not learned
                </span>
              )}
            </div>
          </div>
          <p className="text-sm font-medium">{item.meaning}</p>
        </div>

        {item.example && (
          <div className="bg-muted/50 p-2 rounded-md border border-border/50 max-h-[300px] overflow-auto">
            <div className="text-sm italic text-muted-foreground">
              <DisplayText text={item.example} />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Metadata: Dates */}
      <div className="grid grid-cols-1 gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar size={12} />
          <span>Created: {formatDate(item.createdAt)}</span>
        </div>
        {/* <div className="flex items-center gap-2">
          <Clock size={12} />
          <span>Updated: {formatDate(item.updatedAt)}</span>
        </div> */}
      </div>
    </div>
  );
};
