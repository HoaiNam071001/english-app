import { useEffect, useRef, useState } from "react";

interface UseInViewportOptions {
  /** Vùng mở rộng quanh viewport để preload trước khi phần tử thực sự lọt vào màn hình. */
  rootMargin?: string;
}

/**
 * Theo dõi một phần tử có đang nằm trong (hoặc gần) viewport hay không,
 * dùng để chỉ render nội dung nặng khi cần (virtualize theo scroll).
 */
export function useInViewport<T extends HTMLElement>({
  rootMargin = "600px 0px",
}: UseInViewportOptions = {}) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, isVisible };
}
