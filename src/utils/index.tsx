import { ICON_MAP, TOPIC_COLORS } from "@/constants";
import { Folder } from "lucide-react";

export const isToday = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Helper UI
export const getIconComponent = (iconName: string) =>
  ICON_MAP[iconName] || Folder;
export const getColorStyle = (colorId: string) =>
  TOPIC_COLORS.find((c) => c.id === colorId) || TOPIC_COLORS[0];
