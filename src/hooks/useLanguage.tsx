import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  LanguageCode,
  SUPPORTED_LANGUAGES,
} from "@/i18n";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

const isSupported = (code?: string): code is LanguageCode =>
  SUPPORTED_LANGUAGES.some((lang) => lang.code === code);

/**
 * Quản lý ngôn ngữ hiển thị. Lựa chọn được i18next lưu sẵn vào localStorage,
 * ở đây chỉ ghi thêm một lần nữa cho chắc chắn khi đổi bằng tay.
 */
export const useLanguage = () => {
  const { i18n } = useTranslation();

  const language: LanguageCode = isSupported(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : DEFAULT_LANGUAGE;

  const setLanguage = useCallback(
    (next: LanguageCode) => {
      if (next === language) return;
      i18n.changeLanguage(next);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    },
    [i18n, language],
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "vi" ? "en" : "vi");
  }, [language, setLanguage]);

  return {
    language,
    setLanguage,
    toggleLanguage,
    languages: SUPPORTED_LANGUAGES,
  };
};
