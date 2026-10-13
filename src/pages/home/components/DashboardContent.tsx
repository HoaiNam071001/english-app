import { CommonModal } from "@/components/CommonModal";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTopics } from "@/hooks/useTopics";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useWordTypes } from "@/hooks/useWordTypes";
import { FocusWordRequest, UserProfile, VocabularyItem } from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { useTranslation } from "react-i18next";
import CardContainer, { CardContainerRef } from "./CardContainer";
import { VocabLinkProvider } from "./common/InteractiveText/VocabLinkProvider";
import { ReviewStrip } from "./ReviewStrip";
import { VocabularySidebarContent } from "./VocabularySidebarContent";

interface DashboardContentProps {
  user: UserProfile | null;
}

const ALL_TOPIC_KEY = "ALL";

export const DashboardContent = ({ user }: DashboardContentProps) => {
  const { t } = useTranslation(["home", "common"]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarModalOpen, setIsSidebarModalOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<FocusWordRequest | null>(
    null,
  );
  const cardContainerRef = useRef<CardContainerRef>(null);
  const topicPanelRef = useRef<ImperativePanelHandle>(null);
  const quickReviewPanelRef = useRef<ImperativePanelHandle>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isQuickReviewCollapsed, setIsQuickReviewCollapsed] = useState(false);

  // ReviewStrip tự quản lý trạng thái thu gọn (nút collapse) - khi nó đổi,
  // co/giãn panel Quick Review theo cho khớp thay vì giữ nguyên khoảng trống.
  const handleQuickReviewCollapsedChange = (collapsed: boolean) => {
    const panel = quickReviewPanelRef.current;
    if (!panel) return;
    if (collapsed && !panel.isCollapsed()) panel.collapse();
    if (!collapsed && panel.isCollapsed()) panel.expand();
  };

  const {
    allWords,
    isLoaded,
    fetchAllWords,
    updateWord,
    deleteWord,
    bulkDeleteWords,
    toggleLearnedStatus,
    bulkMarkLearned,
    markAsLearned,
    addVocabulary,
    bulkUpdateWords,
    batchUpdateWords,
  } = useVocabulary();
  const { fetch: fetchWordTypes } = useWordTypes();
  const [mappingActiveWords, setMappingActiveWords] = useState<Set<string>>(
    new Set(),
  );

  const onFetch = async () => {
    await fetchAllWords(false);
  };

  useEffect(() => {
    onFetch();
    fetchWordTypes();
  }, [user]);

  const { topics, addTopic, deleteTopic, updateTopic } = useTopics();

  // Handle: Sidebar -> CardContainer
  const handleAddWordsToPractice = (newWords: VocabularyItem[]) => {
    if (cardContainerRef.current) {
      cardContainerRef.current.addWordsToSession(newWords);
    }
  };

  const handleRemoveWordsToPractice = (words: VocabularyItem[]) => {
    if (cardContainerRef.current) {
      cardContainerRef.current.removeWordsToSession(
        words?.map((e) => e.id) || [],
      );
    }
  };

  // Handle: ReviewStrip -> mở đúng từ trong danh sách từ vựng bên sidebar & cuộn tới nó.
  const handleOpenInVocabulary = (word: VocabularyItem) => {
    const targetTopicId =
      word.topicId && topics.some((tp) => tp.id === word.topicId)
        ? word.topicId
        : ALL_TOPIC_KEY;
    setSelectedTopicId(targetTopicId);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarModalOpen(true);
    } else {
      setIsSidebarOpen(true);
    }
    setFocusRequest({ wordId: word.id, nonce: Date.now() });
  };

  // Đồng bộ 2 chiều với panel topic (kéo-resize/thu gọn bằng tay cũng phải
  // cập nhật lại isSidebarOpen, và ngược lại các nơi set isSidebarOpen bằng
  // code - vd handleOpenInVocabulary - cũng phải mở/đóng panel tương ứng).
  useEffect(() => {
    if (!isDesktop) return;
    const panel = topicPanelRef.current;
    if (!panel) return;
    if (isSidebarOpen && panel.isCollapsed()) panel.expand();
    if (!isSidebarOpen && !panel.isCollapsed()) panel.collapse();
  }, [isDesktop, isSidebarOpen]);

  const filteredWords = useMemo(() => {
    if (!selectedTopicId || selectedTopicId === ALL_TOPIC_KEY) return allWords;
    return allWords.filter((w) => w.topicId === selectedTopicId);
  }, [allWords, selectedTopicId]);

  const handleAddVocabularyWithTopic = async (entries: VocabularyItem[]) => {
    const entriesWithTopic = entries.map((e) => ({
      ...e,
      topicId:
        selectedTopicId && selectedTopicId !== ALL_TOPIC_KEY
          ? selectedTopicId
          : undefined,
    }));
    return await addVocabulary(entriesWithTopic);
  };

  // Bôi đen chữ trong mô tả -> "Tạo từ mới": mở modal thêm từ với text đã điền sẵn
  const handleCreateWordFromText = useCallback((text: string) => {
    cardContainerRef.current?.openCreateWithText(text);
  }, []);

  // Sidebar content component props
  const sidebarContentProps = {
    selectedTopicId,
    topics,
    allWords,
    filteredWords,
    mappingActiveWords,
    onSelectTopic: setSelectedTopicId,
    onAddTopic: addTopic,
    onUpdateTopic: updateTopic,
    onDeleteTopic: deleteTopic,
    onBulkUpdate: bulkUpdateWords,
    onAddToPractice: (word: VocabularyItem) => handleAddWordsToPractice([word]),
    onBulkAddToPractice: handleAddWordsToPractice,
    onBulkDelete: bulkDeleteWords,
    onUpdateWord: updateWord,
    onDelete: deleteWord,
    onToggleLearned: toggleLearnedStatus,
    onBulkMarkLearned: bulkMarkLearned,
    batchUpdateWords,
    onRemoveFromPractice: (value: VocabularyItem) =>
      handleRemoveWordsToPractice([value]),
    focusRequest,
  };

  return (
    <VocabLinkProvider
      words={allWords}
      topics={topics}
      onCreateWord={handleCreateWordFromText}
      onAddToSession={(word) => handleAddWordsToPractice([word])}
      onOpenInVocabulary={handleOpenInVocabulary}
    >
      <div className="flex flex-col gap-2 h-full overflow-hidden">
        {isDesktop ? (
          // DESKTOP: 3 khối topic / sessions / quick review đều resize tự do được (kéo thanh chia),
          // kích cỡ được nhớ lại giữa các lần vào trang (autoSaveId -> localStorage).
          <ResizablePanelGroup
            direction="vertical"
            autoSaveId="vocab-dashboard-v"
            className="flex-1 min-h-0"
          >
            <ResizablePanel
              id="top-row"
              defaultSize={72}
              minSize={35}
              className="min-h-0"
            >
              <ResizablePanelGroup
                direction="horizontal"
                autoSaveId="vocab-dashboard-h"
              >
                <ResizablePanel
                  id="topic"
                  ref={topicPanelRef}
                  defaultSize={24}
                  minSize={16}
                  maxSize={40}
                  collapsible
                  collapsedSize={0}
                  onCollapse={() => setIsSidebarOpen(false)}
                  onExpand={() => setIsSidebarOpen(true)}
                  className="h-full border-r bg-card flex flex-col overflow-hidden"
                >
                  <VocabularySidebarContent {...sidebarContentProps} />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                  id="sessions"
                  defaultSize={76}
                  minSize={30}
                  className="relative min-w-0 h-full"
                >
                  <CardContainer
                    ref={cardContainerRef}
                    allWords={allWords}
                    isLoaded={isLoaded}
                    topics={topics}
                    onActiveChanged={setMappingActiveWords}
                    onMarkLearned={markAsLearned}
                    onUpdateWord={updateWord}
                    onDeleteWord={deleteWord}
                    handleAddVocabulary={handleAddVocabularyWithTopic}
                    onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    isSidebarOpen={isSidebarOpen}
                    onSidebarModalOpen={() => setIsSidebarModalOpen(true)}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              id="quick-review"
              ref={quickReviewPanelRef}
              defaultSize={28}
              minSize={14}
              maxSize={55}
              collapsible
              collapsedSize={6}
              onCollapse={() => setIsQuickReviewCollapsed(true)}
              onExpand={() => setIsQuickReviewCollapsed(false)}
              className="min-h-0"
            >
              <ReviewStrip
                allWords={allWords}
                topics={topics}
                isLoaded={isLoaded}
                onUpdateWord={updateWord}
                onDeleteWord={deleteWord}
                onOpenInVocabulary={handleOpenInVocabulary}
                onAddToSession={(word) => handleAddWordsToPractice([word])}
                fillHeight
                onCollapsedChange={handleQuickReviewCollapsedChange}
                panelCollapsed={isQuickReviewCollapsed}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          // MOBILE: topic mở qua modal riêng (không đủ chỗ để chia cột), sessions full width.
          <>
            <div className="flex flex-1 relative overflow-hidden min-h-0">
              <div className="relative flex-1 min-w-0 h-full">
                <CardContainer
                  ref={cardContainerRef}
                  allWords={allWords}
                  isLoaded={isLoaded}
                  topics={topics}
                  onActiveChanged={setMappingActiveWords}
                  onMarkLearned={markAsLearned}
                  onUpdateWord={updateWord}
                  onDeleteWord={deleteWord}
                  handleAddVocabulary={handleAddVocabularyWithTopic}
                  onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                  isSidebarOpen={isSidebarOpen}
                  onSidebarModalOpen={() => setIsSidebarModalOpen(true)}
                />
              </div>
            </div>

            <ReviewStrip
              allWords={allWords}
              topics={topics}
              isLoaded={isLoaded}
              onUpdateWord={updateWord}
              onDeleteWord={deleteWord}
              onOpenInVocabulary={handleOpenInVocabulary}
              onAddToSession={(word) => handleAddWordsToPractice([word])}
            />
          </>
        )}

        {/* SIDEBAR MODAL - Mobile only */}
        <CommonModal
          open={isSidebarModalOpen}
          onOpenChange={setIsSidebarModalOpen}
          title={t("dashboard.sidebarModalTitle")}
          closeOnInteractOutside={true}
          footer={null}
          contentClassName={"overflow-hidden"}
        >
          <div className="w-full h-[70vh] flex flex-col overflow-hidden">
            <VocabularySidebarContent {...sidebarContentProps} />
          </div>
        </CommonModal>
      </div>
    </VocabLinkProvider>
  );
};
