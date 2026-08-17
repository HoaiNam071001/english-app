import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import moment from "moment";
import "moment/locale/vi";
import { initReactI18next } from "react-i18next";

import enAdmin from "./locales/en/admin.json";
import enAuth from "./locales/en/auth.json";
import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import enLanding from "./locales/en/landing.json";
import enNote from "./locales/en/note.json";
import enProfile from "./locales/en/profile.json";
import enShared from "./locales/en/shared.json";
import enShortcuts from "./locales/en/shortcuts.json";

import viAdmin from "./locales/vi/admin.json";
import viAuth from "./locales/vi/auth.json";
import viCommon from "./locales/vi/common.json";
import viHome from "./locales/vi/home.json";
import viLanding from "./locales/vi/landing.json";
import viNote from "./locales/vi/note.json";
import viProfile from "./locales/vi/profile.json";
import viShared from "./locales/vi/shared.json";
import viShortcuts from "./locales/vi/shortcuts.json";

export const LANGUAGE_STORAGE_KEY = "language-preference";

export const SUPPORTED_LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: LanguageCode = "vi";

export const resources = {
  vi: {
    common: viCommon,
    landing: viLanding,
    auth: viAuth,
    home: viHome,
    note: viNote,
    shared: viShared,
    profile: viProfile,
    admin: viAdmin,
    shortcuts: viShortcuts,
  },
  en: {
    common: enCommon,
    landing: enLanding,
    auth: enAuth,
    home: enHome,
    note: enNote,
    shared: enShared,
    profile: enProfile,
    admin: enAdmin,
    shortcuts: enShortcuts,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.code),
    ns: [
      "common",
      "landing",
      "auth",
      "home",
      "note",
      "shared",
      "profile",
      "admin",
      "shortcuts",
    ],
    defaultNS: "common",
    detection: {
      // Ưu tiên lựa chọn đã lưu ở local, sau đó mới tới ngôn ngữ trình duyệt
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });

/** Đồng bộ ngôn ngữ với thẻ <html> và với moment (dùng để format ngày tháng) */
const applyLanguage = (lng: string) => {
  document.documentElement.lang = lng;
  moment.locale(lng);
};

applyLanguage(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);
i18n.on("languageChanged", applyLanguage);

export default i18n;
