import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TopicItem, VocabularyItem } from "@/types";
import { Calendar, Hash, Layers, PlusCircle } from "lucide-react";
import moment from "moment";
import React, { useMemo, useState } from "react";

interface AddCardControlProps {
  allWords: VocabularyItem[];
  displayCards: VocabularyItem[]; // To exclude words already displayed
  topics: TopicItem[];
  onAdd: (wordsToAdd: VocabularyItem[]) => void;
}

enum AddMode {
  QUANTITY = "QUANTITY",
  DATE = "DATE",
  TOPIC = "TOPIC",
}

export const AddCardControl: React.FC<AddCardControlProps> = ({
  allWords,
  displayCards,
  topics,
  onAdd,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AddMode>(AddMode.QUANTITY);

  const [quantity, setQuantity] = useState<string>("10");

  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

  // 1. Calculate available words (exclude displayed ones)
  const availableWords = useMemo(() => {
    const displayedIds = new Set(displayCards.map((w) => w.id));
    return allWords.filter((w) => !displayedIds.has(w.id));
  }, [allWords, displayCards]);

  // 2. Group words by date for options
  const availableDates = useMemo(() => {
    const groups: Record<
      string,
      { label: string; count: number; dateStr: string }
    > = {};

    availableWords.forEach((w) => {
      const dateStr = moment(w.createdAt).format("YYYY-MM-DD");
      if (!groups[dateStr]) {
        let label = dateStr;
        if (moment(dateStr).isSame(moment(), "day")) label = "Today";
        else if (moment(dateStr).isSame(moment().subtract(1, "days"), "day"))
          label = "Yesterday";

        groups[dateStr] = { label, count: 0, dateStr };
      }
      groups[dateStr].count++;
    });

    return Object.values(groups).sort((a, b) =>
      b.dateStr.localeCompare(a.dateStr)
    );
  }, [availableWords]);

  // --- LOGIC HANDLERS ---

  const handleToggleSet = (
    set: Set<string>,
    val: string,
    setFn: (s: Set<string>) => void
  ) => {
    const newSet = new Set(set);
    if (newSet.has(val)) newSet.delete(val);
    else newSet.add(val);
    setFn(newSet);
  };

  const handleSubmit = () => {
    let result: VocabularyItem[] = [];

    if (mode === AddMode.QUANTITY) {
      const count = parseInt(quantity, 10) || 0;
      if (count > 0) {
        // Random shuffle and take N words
        const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
        result = shuffled.slice(0, count);
      }
    } else if (mode === AddMode.DATE) {
      result = availableWords.filter((w) =>
        selectedDates.has(moment(w.createdAt).format("YYYY-MM-DD"))
      );
    } else if (mode === AddMode.TOPIC) {
      result = availableWords.filter(
        (w) => w.topicId && selectedTopics.has(w.topicId)
      );
    }

    if (result.length > 0) {
      onAdd(result);
      setIsOpen(false);
      setSelectedDates(new Set());
      setSelectedTopics(new Set());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <PlusCircle size={18} /> Add Cards
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Flashcards</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 1. SELECT MODE */}
          <div className="space-y-2">
            <Label>Select Method:</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as AddMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AddMode.QUANTITY}>
                  <div className="flex items-center gap-2">
                    <Hash size={16} /> Random Quantity
                  </div>
                </SelectItem>
                <SelectItem value={AddMode.DATE}>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} /> By Date Created
                  </div>
                </SelectItem>
                <SelectItem value={AddMode.TOPIC}>
                  <div className="flex items-center gap-2">
                    <Layers size={16} /> By Topic
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 2. OPTION CONTENT BASED ON MODE */}
          <div className="min-h-[150px] border rounded-md p-3 bg-muted/50">
            {/* MODE: QUANTITY */}
            {mode === AddMode.QUANTITY && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  System will randomly select words not currently displayed.
                  <br />
                  (Available: <strong>{availableWords.length}</strong> words)
                </p>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 20].map((num) => (
                    <Button
                      key={num}
                      type="button"
                      variant={
                        quantity === num.toString() ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setQuantity(num.toString())}
                      className="flex-1"
                    >
                      {num} words
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap">
                    Custom amount:
                  </Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min={1}
                    max={availableWords.length}
                  />
                </div>
              </div>
            )}

            {/* MODE: DATE */}
            {mode === AddMode.DATE && (
              <ScrollArea className="h-[200px] pr-3">
                {availableDates.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center pt-10">
                    No dates available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableDates.map((item) => (
                      <div
                        key={item.dateStr}
                        className="flex items-center space-x-2 border-b border-border pb-2 last:border-0"
                      >
                        <Checkbox
                          id={`date-${item.dateStr}`}
                          checked={selectedDates.has(item.dateStr)}
                          onCheckedChange={() =>
                            handleToggleSet(
                              selectedDates,
                              item.dateStr,
                              setSelectedDates
                            )
                          }
                        />
                        <Label
                          htmlFor={`date-${item.dateStr}`}
                          className="flex-1 flex justify-between cursor-pointer"
                        >
                          <div className="cursor-pointer">{item.label}</div>
                          <span className="text-xs bg-muted px-1.5 rounded-full text-foreground h-fit">
                            {item.count}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}

            {/* MODE: TOPIC */}
            {mode === AddMode.TOPIC && (
              <ScrollArea className="h-[200px] pr-3">
                {topics.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center pt-10">
                    No topics found
                  </p>
                ) : (
                  <div className="space-y-2">
                    {topics.map((topic) => {
                      // Count available words in this topic
                      const count = availableWords.filter(
                        (w) => w.topicId === topic.id
                      ).length;
                      if (count === 0) return null; // Hide topics with no available words

                      return (
                        <div
                          key={topic.id}
                          className="flex items-center space-x-2 border-b border-border pb-2 last:border-0"
                        >
                          <Checkbox
                            id={`topic-${topic.id}`}
                            checked={selectedTopics.has(topic.id)}
                            onCheckedChange={() =>
                              handleToggleSet(
                                selectedTopics,
                                topic.id,
                                setSelectedTopics
                              )
                            }
                          />
                          <Label
                            className="flex-1 flex justify-between cursor-pointer"
                            htmlFor={`topic-${topic.id}`}
                          >
                            <div className="cursor-pointer truncate max-w-[180px]">
                              {topic.label}
                            </div>
                            <span className="text-xs bg-muted px-1.5 rounded-full text-foreground h-fit">
                              {count}
                            </span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={availableWords.length === 0}>
            Add (
            {mode === AddMode.DATE
              ? selectedDates.size
              : mode === AddMode.TOPIC
              ? selectedTopics.size
              : quantity}
            )
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
