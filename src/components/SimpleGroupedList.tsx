import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

// Định nghĩa kiểu dữ liệu chặt chẽ cho Flatten Item
type FlatItem =
  | { type: "group"; groupIndex: number; originalIndex: number }
  | {
    type: "item";
    groupIndex: number;
    itemIndex: number;
    originalIndex: number;
  };

interface SimpleGroupedListProps {
  groupCounts: number[];
  groupContent: (index: number) => React.ReactNode;
  itemContent: (
    index: number,
    groupIndex: number,
    itemIndex: number
  ) => React.ReactNode;
  className?: string;
  estimateRowHeight?: number;
}

export interface SimpleGroupedListHandle {
  /** Cuộn tới 1 item cụ thể (theo groupIndex/itemIndex trong groupCounts truyền vào). */
  scrollToItem: (
    groupIndex: number,
    itemIndex: number,
    opts?: { align?: "start" | "center"; behavior?: ScrollBehavior }
  ) => void;
}

export const SimpleGroupedList = forwardRef<
  SimpleGroupedListHandle,
  SimpleGroupedListProps
>(
  (
    { groupCounts, groupContent, itemContent, className, estimateRowHeight = 50 },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState<number>(0);
    const heightCache = useRef<Record<number, number>>({});

    const flatData = useMemo<FlatItem[]>(() => {
      const data: FlatItem[] = [];
      let counter = 0;
      groupCounts.forEach((count, gIdx) => {
        data.push({ type: "group", groupIndex: gIdx, originalIndex: counter++ });
        for (let i = 0; i < count; i++) {
          data.push({
            type: "item",
            groupIndex: gIdx,
            itemIndex: i,
            originalIndex: counter++,
          });
        }
      });
      return data;
    }, [groupCounts]);

    const getItemHeight = (index: number): number => {
      return heightCache.current[index] || estimateRowHeight;
    };

    useImperativeHandle(
      ref,
      () => ({
        scrollToItem: (groupIndex, itemIndex, opts) => {
          const target = flatData.find(
            (f) =>
              f.type === "item" &&
              f.groupIndex === groupIndex &&
              f.itemIndex === itemIndex
          );
          if (!target || !containerRef.current) return;
          let offset = 0;
          for (let i = 0; i < target.originalIndex; i++) {
            offset += getItemHeight(i);
          }
          const align = opts?.align || "center";
          const top =
            align === "center"
              ? Math.max(0, offset - containerRef.current.clientHeight / 2)
              : offset;
          containerRef.current.scrollTo({
            top,
            behavior: opts?.behavior || "smooth",
          });
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [flatData]
    );

    const totalHeight = flatData.reduce(
      (sum, _, idx) => sum + getItemHeight(idx),
      0
    );

    // Tìm startIndex dựa trên scrollTop
    let currentOffset = 0;
    let startIndex = 0;
    for (let i = 0; i < flatData.length; i++) {
      const h = getItemHeight(i);
      if (currentOffset + h > scrollTop) {
        startIndex = i;
        break;
      }
      currentOffset += h;
    }

    const containerHeight = containerRef.current?.clientHeight || 800;
    let endIndex = startIndex;
    let visibleHeight = 0;
    while (endIndex < flatData.length && visibleHeight < containerHeight + 200) {
      visibleHeight += getItemHeight(endIndex);
      endIndex++;
    }

    // LOGIC STICKY: Đảm bảo header của group hiện tại luôn được render
    const startItem = flatData[startIndex];
    let renderStartIndex = startIndex;
    if (startItem && startItem.type === "item") {
      for (let i = startIndex - 1; i >= 0; i--) {
        if (
          flatData[i].type === "group" &&
          flatData[i].groupIndex === startItem.groupIndex
        ) {
          renderStartIndex = i;
          break;
        }
      }
    }

    // Tính paddingTop bằng cách cộng dồn chiều cao các item phía trên renderStartIndex
    const paddingTop = useMemo(() => {
      let padding = 0;
      for (let i = 0; i < renderStartIndex; i++) {
        padding += getItemHeight(i);
      }
      return padding;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [renderStartIndex, flatData, estimateRowHeight]);

    const itemsToRender = flatData.slice(renderStartIndex, endIndex);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    };

    return (
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`overflow-y-auto overflow-x-hidden h-full w-full relative ${className || ""}`}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {/* THAY ĐỔI: Sử dụng padding thay vì transform để không làm hỏng sticky */}
          <div style={{ paddingTop: `${paddingTop}px` }}>
            {itemsToRender.map((item) => {
              const isGroup = item.type === "group";
              return (
                <div
                  key={item.originalIndex}
                  className={isGroup ? "sticky top-0 z-10" : "relative"}
                  style={isGroup ? { backgroundColor: "var(--background)" } : {}}
                  ref={(el) => {
                    if (el) {
                      const h = el.getBoundingClientRect().height;
                      if (
                        heightCache.current[item.originalIndex] !== h &&
                        h > 0
                      ) {
                        heightCache.current[item.originalIndex] = h;
                      }
                    }
                  }}
                >
                  {isGroup
                    ? groupContent(item.groupIndex)
                    : itemContent(
                      item.originalIndex,
                      item.groupIndex,
                      item.itemIndex
                    )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

SimpleGroupedList.displayName = "SimpleGroupedList";
