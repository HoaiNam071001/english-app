import { CommonModal } from "@/components/CommonModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TopicItem, VocabularyItem } from "@/types";
import { Info } from "lucide-react";
import React, { useEffect, useState } from "react";
import { VocabularyDetailContent } from "./VocabularyDetailContent";

interface VocabularyDetailPopupProps {
  item: VocabularyItem;
  topic?: TopicItem;
  trigger: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const VocabularyDetailPopup: React.FC<VocabularyDetailPopupProps> = ({
  item,
  topic,
  trigger,
  side = "right",
  align = "center",
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <>
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="inline-block"
        >
          {trigger}
        </div>
        <CommonModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          title="Vocabulary Details"
          icon={<Info size={18} />}
          footer={null}
        >
          <VocabularyDetailContent item={item} topic={topic} />
        </CommonModal>
      </>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        className="w-max p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <VocabularyDetailContent item={item} topic={topic} />
      </PopoverContent>
    </Popover>
  );
};

