import { cn } from "@/lib/utils";
import type { ElementBuilder } from "skeleton-styler";
import { useEffect, useRef, type ReactNode } from "react";

/** Nhận thẳng instance hoặc factory để tạo lại mỗi lần render skeleton. */
type SkeletonInstance = ElementBuilder | (() => ElementBuilder);

const resolve = (instance: SkeletonInstance) =>
  typeof instance === "function" ? instance() : instance;

interface SkeletonBoxProps {
  /** Bố cục skeleton dựng bằng skeleton-styler. */
  instance: SkeletonInstance;
  className?: string;
}

/**
 * Render một bố cục skeleton-styler vào DOM. Dùng khi cần chèn skeleton
 * độc lập (không bọc children), ví dụ trong nhánh loading của một điều kiện.
 */
export const SkeletonBox = ({ instance, className }: SkeletonBoxProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.replaceChildren(resolve(instance).generate());
    return () => el.replaceChildren();
  }, [instance]);

  return (
    <div
      ref={ref}
      className={cn("w-full", className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
    />
  );
};

interface SkeletonWrapperProps extends SkeletonBoxProps {
  loading: boolean;
  children: ReactNode;
}

/**
 * Hiện skeleton trong lúc `loading`, sau đó trả về `children`.
 * Children chỉ được mount khi đã có dữ liệu nên không tốn render trung gian.
 */
export const SkeletonWrapper = ({
  loading,
  instance,
  className,
  children,
}: SkeletonWrapperProps) => {
  if (!loading) return <>{children}</>;
  return <SkeletonBox instance={instance} className={className} />;
};
