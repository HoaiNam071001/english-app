import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ICON_KEYS, ICON_MAP, TOPIC_COLORS } from "@/constants";
import { TopicItem, VocabularyItem } from "@/types";
import { getColorStyle, getIconComponent } from "@/utils";
import { Folder, FolderPlus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";

interface TopicListProps {
  topics: TopicItem[];
  vocabulary: VocabularyItem[]; // <--- 1. Thêm prop này để đếm số lượng
  onSelectTopic: (topicId: string | null) => void;
  onAddTopic: (item: Partial<TopicItem>) => void;
  onUpdateTopic: (id: string, item: Partial<TopicItem>) => void; // <--- 2. Thêm prop update
  onDeleteTopic: (id: string) => void;
}

const TopicList: React.FC<TopicListProps> = ({
  topics,
  vocabulary,
  onSelectTopic,
  onAddTopic,
  onUpdateTopic,
  onDeleteTopic,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null); // null = mode create

  // Form State
  const [label, setLabel] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState("blue");
  const [icon, setIcon] = useState("folder");

  // --- LOGIC ĐẾM SỐ LƯỢNG TỪ ---
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    vocabulary.forEach((word) => {
      if (word.topicId) {
        counts[word.topicId] = (counts[word.topicId] || 0) + 1;
      }
    });
    return counts;
  }, [vocabulary]);

  // --- HANDLERS ---
  const resetForm = () => {
    setLabel("");
    setDesc("");
    setColor("blue");
    setIcon("folder");
    setEditingTopicId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (topic: TopicItem) => {
    setLabel(topic.label);
    setDesc(topic.desc || "");
    setColor(topic.color || "blue");
    setIcon(topic.icon || "folder");
    setEditingTopicId(topic.id);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!label.trim()) return;

    const topicData = { label, desc, color, icon };

    if (editingTopicId) {
      // Update
      onUpdateTopic(editingTopicId, topicData);
    } else {
      // Create
      onAddTopic(topicData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="flex flex-col h-full bg-muted/30">
      <div className="px-4 pb-2 border-b flex justify-between items-center bg-card">
        <h3 className="font-semibold text-card-foreground">Topics</h3>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1"
          onClick={handleOpenCreate}
        >
          <FolderPlus size={16} /> <span className="text-xs">New</span>
        </Button>
      </div>

      <div className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-2">
          {/* Default 'All Topics' Item */}
          <div
            onClick={() => onSelectTopic(null)}
            className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all shadow-sm group"
          >
            <div className="bg-muted p-2.5 rounded-full text-muted-foreground">
              <Folder size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-card-foreground">All Vocabulary</h4>
              <p className="text-xs text-muted-foreground">
                Total: {vocabulary.length} words
              </p>
            </div>
          </div>

          {/* Dynamic Topics List */}
          {topics.map((topic) => {
            const style = getColorStyle(topic.color || "blue");
            const TopicIcon = getIconComponent(topic.icon || "folder");
            const wordCount = topicCounts[topic.id] || 0; // Lấy số lượng từ

            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic.id)}
                className="relative flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all shadow-sm group"
              >
                {/* Icon */}
                <div className={`${style.bg} ${style.text} p-2.5 rounded-full`}>
                  <TopicIcon size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-card-foreground truncate">
                    {topic.label}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-muted-foreground">
                      {wordCount} words
                    </span>
                    <span>•</span>
                    <span className="truncate">
                      {topic.desc || "No description"}
                    </span>
                  </div>
                </div>

                {/* Action Menu */}
                <div
                  className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(topic)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Topic
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteTopic(topic.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Topic
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- DIALOG CREATE / EDIT --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTopicId ? "Edit Topic" : "Create New Topic"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Topic Name</Label>
              <Input
                placeholder="e.g. IELTS, Travel..."
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Short description..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="h-20"
              />
            </div>

            {/* Color Grid */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {TOPIC_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`w-8 h-8 rounded-full ${
                      c.bg
                    } border-2 transition-all flex items-center justify-center
                      ${
                        color === c.id
                          ? "border-foreground shadow-sm"
                          : "border-transparent"
                      }`}
                  >
                    {color === c.id && (
                      <div className="w-2.5 h-2.5 bg-foreground rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Grid */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <ScrollArea className="h-32 rounded-md border p-2 bg-muted/50">
                <div className="grid grid-cols-6 gap-2 p-1">
                  {ICON_KEYS.map((k) => {
                    const IconComp = ICON_MAP[k];
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setIcon(k)}
                        className={`p-2 rounded-md flex items-center justify-center transition-all
                          ${
                            icon === k
                              ? "bg-accent text-foreground ring-2 ring-ring"
                              : "text-muted-foreground hover:bg-card hover:shadow-sm"
                          }`}
                      >
                        <IconComp size={20} />
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white "
            >
              {editingTopicId ? "Save Changes" : "Create Topic"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopicList;
