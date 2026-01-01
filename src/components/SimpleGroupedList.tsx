import React, { useMemo, useRef, useState } from "react";

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

export const SimpleGroupedList: React.FC<SimpleGroupedListProps> = ({
  groupCounts,
  groupContent,
  itemContent,
  className,
  estimateRowHeight = 50,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const heightCache = useRef<Record<number, number>>({});

  // 1. Làm phẳng danh sách (Flatten) để tính toán tọa độ
  const flatData = useMemo<FlatItem[]>(() => {
    const data: FlatItem[] = [];
    let counter = 0;
    groupCounts.forEach((count, gIdx) => {
      // Thêm Header
      data.push({ type: "group", groupIndex: gIdx, originalIndex: counter++ });
      // Thêm Items
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

  // 2. Tính tổng chiều cao
  const totalHeight = flatData.reduce(
    (sum, _, idx) => sum + getItemHeight(idx),
    0
  );

  // 3. Tìm khoảng hiển thị
  let currentOffset = 0;
  let startIndex = 0;

  // Tìm item bắt đầu hiển thị
  for (let i = 0; i < flatData.length; i++) {
    const h = getItemHeight(i);
    if (currentOffset + h > scrollTop) {
      startIndex = i;
      break;
    }
    currentOffset += h;
  }

  // Tìm item kết thúc (Render dư ra 3 item để scroll mượt)
  const containerHeight = containerRef.current?.clientHeight || 800;
  let endIndex = startIndex;
  let visibleHeight = 0;

  while (endIndex < flatData.length && visibleHeight < containerHeight + 200) {
    visibleHeight += getItemHeight(endIndex);
    endIndex++;
  }

  // LOGIC STICKY HEADER:
  // Luôn đảm bảo Header của group hiện tại được render để CSS sticky hoạt động
  const startItem = flatData[startIndex];
  let renderStartIndex = startIndex;

  if (startItem && startItem.type === "item") {
    // Quay lui tìm header của group này
    for (let i = startIndex - 1; i >= 0; i--) {
      const item = flatData[i];
      if (item.type === "group" && item.groupIndex === startItem.groupIndex) {
        renderStartIndex = i;
        break;
      }
    }
  }

  // Tính padding để đẩy nội dung xuống đúng vị trí
  const paddingTop = useMemo<number>(() => {
    let padding = 0;
    for (let i = 0; i < renderStartIndex; i++) {
      padding += getItemHeight(i);
    }
    return padding;
  }, [renderStartIndex, flatData, estimateRowHeight]); // eslint-disable-line

  const itemsToRender = flatData.slice(renderStartIndex, endIndex);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto h-full w-full relative ${className || ""}`}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${paddingTop}px)` }}>
          {itemsToRender.map((item) => (
            <div
              key={item.originalIndex}
              ref={(el) => {
                if (el) {
                  const h = el.getBoundingClientRect().height;
                  // Cache chiều cao thật để tính toán chính xác lần sau
                  if (heightCache.current[item.originalIndex] !== h) {
                    heightCache.current[item.originalIndex] = h;
                  }
                }
              }}
            >
              {item.type === "group"
                ? groupContent(item.groupIndex)
                : itemContent(
                    item.originalIndex,
                    item.groupIndex,
                    item.itemIndex
                  )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
