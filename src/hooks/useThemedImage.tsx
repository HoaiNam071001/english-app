import { useTheme } from "@/contexts/ThemeContext";

/**
 * Ảnh mặc định là bản dark (vd: /home-1.png), bản light thêm hậu tố "-light"
 * trước phần mở rộng (vd: /home-1-light.png).
 */
export const lightVariant = (darkSrc: string) =>
  darkSrc.replace(/(\.[a-z0-9]+)$/i, "-light$1");

/** Trả về đường dẫn ảnh tương ứng với theme hiện tại. */
export const useThemedImage = (darkSrc: string) => {
  const { theme } = useTheme();
  return theme === "light" ? lightVariant(darkSrc) : darkSrc;
};
