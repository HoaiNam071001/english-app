import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTopics } from "@/hooks/useTopics";
import { getColorStyle, getIconComponent } from "@/utils";
import { Folder } from "lucide-react";
import React, { useState } from "react";

// -------------------------------------------------------------------

interface TopicSelectorProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({
  value,
  onChange,
  placeholder = "-- Uncategorized --",
  className,
}) => {
  const { topics } = useTopics();
  const [CurrentIcon] = useState(() => getIconComponent(value));
  const handleValueChange = (val: string) => {
    onChange(val);
  };

  const currentTopic = topics.find((t) => t.id === value);
  const currentColor = getColorStyle(currentTopic?.color);

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className={`w-full ${className}`}>
        <SelectValue placeholder="Select topic">
          <div className="flex items-center gap-2 w-full">
            {value && currentTopic ? (
              <>
                <div
                  className={`p-1 rounded-md ${currentColor.bg} ${currentColor.text}`}
                >
                  {/* Render Icon như một Component bình thường */}
                  <CurrentIcon size={14} />
                </div>
                <span className="truncate">{currentTopic.label}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectItem value={null}>
          <div className="flex items-center gap-2 text-slate-500">
            <div className="p-1 rounded-md bg-slate-100">
              <Folder size={14} />
            </div>
            <span>Uncategorized</span>
          </div>
        </SelectItem>

        {topics.map((topic) => {
          // Lấy Icon cho từng item trong dropdown
          const TopicIcon = getIconComponent(topic.icon);
          const colorStyle = getColorStyle(topic.color);

          return (
            <SelectItem key={topic.id} value={topic.id}>
              <div className="flex items-center gap-2">
                <div
                  className={`p-1 rounded-md ${colorStyle.bg} ${colorStyle.text}`}
                >
                  <TopicIcon size={14} />
                </div>
                <span className="truncate">{topic.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default TopicSelector;
