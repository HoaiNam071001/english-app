import { PartOfSpeech } from "@/types";
import { getPartOfSpeechStyle, getShortPartOfSpeech } from "@/utils";

export const PartSpeech = ({ data }: { data?: PartOfSpeech[] }) => {
  return (
    <div className="flex flex-wrap justify-center gap-1 text-[8px]">
      {data?.map((pos) => (
        <span
          key={pos}
          className={`
             px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter border
            ${getPartOfSpeechStyle(pos)}
          `}
          title={pos}
        >
          {getShortPartOfSpeech(pos)}
        </span>
      ))}
    </div>
  );
};
