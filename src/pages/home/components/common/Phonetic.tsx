import { AccentType, VocabularyItem } from "@/types";

export const Phonetics = ({ item }: { item: VocabularyItem }) => {
  const usInfo = item.phonetics?.find((p) => p.accent === AccentType.US);
  if (usInfo)
    return (
      <div className="text-[10px] inline-block text-blue-500 font-mono tracking-wider select-none">
        {usInfo.text}
      </div>
    );
  const ukInfo = item.phonetics?.find((p) => p.accent === AccentType.UK);
  if (ukInfo)
    return (
      <div className="text-[10px] inline-block font-mono tracking-wider text-cyan-500 select-none">
        {ukInfo.text}
      </div>
    );
  return <></>;
};
