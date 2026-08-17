import {
  ElementBuilder,
  SkeletonAnimation,
  SkeletonTemplate,
} from "skeleton-styler";

/**
 * Màu skeleton trỏ tới CSS variable trong index.css nên tự đổi theo light/dark
 * mà không cần render lại (thư viện gán màu bằng inline style).
 *
 * Dùng tên riêng thay vì `--sg-skeleton` của thư viện: `dist/index.css` khai báo
 * `:root { --sg-skeleton: #e3e3e3 }` và được inject sau `index.css`, nên override
 * trong `.dark` sẽ bị mất (skeleton trắng lóa ở dark mode).
 */
const SKELETON_COLORS = ["var(--skeleton-base)", "var(--skeleton-highlight)"];

ElementBuilder.setConfigs({
  animation: SkeletonAnimation.Progress,
  colors: SKELETON_COLORS,
});

const block = () => new ElementBuilder();
const bar = (w: string | number, h: number, r: string | number = 6) =>
  new ElementBuilder().markAsSkeleton().s_w(w).s_h(h).s_rounded(r);
const circle = (size: number) =>
  new ElementBuilder().markAsSkeleton().s_w(size).s_h(size).s_roundedFull();
const column = (gap: string | number = 8) =>
  new ElementBuilder().s_flexColumn().s_gap(gap).s_wFull();
const row = (gap: string | number = 8) =>
  new ElementBuilder().s_flexRow().s_itemsCenter().s_gap(gap).s_wFull();
const repeat = (count: number, build: (index: number) => ElementBuilder) =>
  Array.from({ length: count }, (_, index) => build(index));

/** Một card chung: khối tiêu đề + 2 dòng nội dung + footer. */
const cardSkeleton = () =>
  column(10)
    .s_p(16)
    .s_rounded(12)
    .s_border(1, "solid", "var(--border)")
    .append(
      bar("55%", 18),
      bar("85%", 12),
      bar("70%", 12),
      row(8).s_mt(6).append(bar(56, 20, 999), bar(44, 20, 999)),
    );

/** Khung app lúc khởi động: header + toolbar + lưới nội dung. */
export const appShellSkeleton = () =>
  column(24)
    .s_p(24)
    .s_hFull()
    .append(
      row(12).append(circle(36), bar(160, 18), block().s_flex1(), bar(96, 32, 8)),
      row(8).append(...repeat(4, () => bar(88, 30, 999))),
      new ElementBuilder()
        .s_grid()
        .s_style("grid-template-columns", "repeat(auto-fill, minmax(220px, 1fr))")
        .s_gap(16)
        .s_wFull()
        .append(...repeat(8, () => cardSkeleton())),
    );

/** Danh sách note dạng lưới hoặc dạng list. */
export const noteListSkeleton = (layout: "grid" | "list", count = 6) =>
  layout === "grid"
    ? new ElementBuilder()
        .s_grid()
        .s_style("grid-template-columns", "repeat(auto-fill, minmax(240px, 1fr))")
        .s_gap(20)
        .s_wFull()
        .append(
          ...repeat(count, () =>
            column(10)
              .s_p(16)
              .s_rounded(12)
              .s_border(1, "solid", "var(--border)")
              .append(
                row(8).append(bar(28, 28, 8), bar("60%", 16)),
                bar("100%", 10),
                bar("92%", 10),
                bar("70%", 10),
                row(8).s_mt(8).append(bar(64, 18, 999), block().s_flex1(), bar(40, 18, 999)),
              ),
          ),
        )
    : column(12).append(
        ...repeat(count, () =>
          row(14)
            .s_p(14)
            .s_rounded(12)
            .s_border(1, "solid", "var(--border)")
            .append(
              bar(36, 36, 8),
              column(8).append(bar("45%", 14), bar("75%", 10)),
              bar(72, 24, 999),
            ),
        ),
      );

/** Lưới card user trong trang admin (2 cột trên xl). */
export const userCardsSkeleton = (count = 6) =>
  new ElementBuilder()
    .s_grid()
    .s_style("grid-template-columns", "repeat(auto-fill, minmax(320px, 1fr))")
    .s_gap(16)
    .s_wFull()
    .append(
      ...repeat(count, () =>
        row(12)
          .s_itemsStart()
          .s_p(16)
          .s_rounded(12)
          .s_border(1, "solid", "var(--border)")
          .append(
            circle(40),
            column(8).append(bar("50%", 15), bar("70%", 11), bar("40%", 11)),
            column(8).s_w(96).s_itemsEnd().append(bar(72, 22, 6), bar(56, 22, 6)),
          ),
      ),
    );

/** Danh sách từ được chia sẻ, nhóm theo ngày. */
export const sharedListSkeleton = (groups = 2, rowsPerGroup = 4) =>
  column(28).append(
    ...repeat(groups, () =>
      column(12).append(
        row(10).append(bar(120, 14), block().s_flex1().s_h(1).s_bg("var(--border)")),
        ...repeat(rowsPerGroup, () =>
          row(12)
            .s_p(12)
            .s_rounded(10)
            .s_border(1, "solid", "var(--border)")
            .append(
              bar(18, 18, 4),
              column(6).append(bar("35%", 13), bar("60%", 10)),
              bar(64, 20, 999),
            ),
        ),
      ),
    ),
  );

/** Vùng flashcard: thanh tab + thẻ lớn ở giữa. */
export const flashcardSkeleton = () =>
  column(16)
    .s_p(16)
    .s_hFull()
    .append(
      row(8).append(...repeat(3, () => bar(104, 30, 8)), block().s_flex1(), bar(32, 30, 8)),
      new ElementBuilder()
        .s_flexColumn()
        .s_itemsCenter()
        .s_justifyCenter()
        .s_gap(14)
        .s_flex1()
        .s_wFull()
        .append(
          bar("min(560px, 92%)", 260, 16),
          row(10).s_justifyCenter().append(bar(40, 40, 999), bar(120, 40, 999), bar(40, 40, 999)),
        ),
    );

/** Một dòng trong bảng tra từ hàng loạt (dùng bên trong <td>). */
export const lookupRowSkeleton = () =>
  row(10).append(bar("30%", 12), bar("45%", 12), bar("20%", 12));

/** Sidebar danh sách chủ đề / từ vựng. */
export const sidebarListSkeleton = (count = 8) =>
  column(10)
    .s_p(12)
    .append(
      bar("70%", 16),
      ...repeat(count, (index) =>
        row(10).append(bar(16, 16, 4), bar(`${60 + ((index * 13) % 35)}%`, 12)),
      ),
    );

export { ElementBuilder, SkeletonAnimation, SkeletonTemplate };
