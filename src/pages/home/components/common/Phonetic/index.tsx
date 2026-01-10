import { AccentType, VocabularyItem } from "@/types";
import { Phonetic } from "./PhoneticItem";

export const Phonetics = ({
  item,
  className,
}: {
  item: VocabularyItem;
  className?: string;
}) => {
  const usInfo = item.phonetics?.find((p) => p.accent === AccentType.US);
  if (usInfo)
    return (
      <Phonetic
        className={className}
        accent={usInfo.accent}
        text={usInfo.text}
      />
    );
  const ukInfo = item.phonetics?.find((p) => p.accent === AccentType.UK);
  if (ukInfo)
    return (
      <Phonetic
        className={className}
        accent={ukInfo.accent}
        text={ukInfo.text}
      />
    );
  const auInfo = item.phonetics?.find((p) => p.accent === AccentType.AU);
  if (auInfo)
    return (
      <Phonetic
        className={className}
        accent={auInfo.accent}
        text={auInfo.text}
      />
    );
  return <></>;
};
