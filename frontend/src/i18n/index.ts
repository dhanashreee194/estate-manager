import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import mr from "./locales/mr.json";

export const SUPPORTED_LANGS = [
  { code: "en", label: "English", native: "English" },
  { code: "mr", label: "Marathi", native: "मराठी" },
] as const;

export type AppLang = (typeof SUPPORTED_LANGS)[number]["code"];

const STORAGE_KEY = "estate-manager-lang";

export function getStoredLang(): AppLang {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "mr") return stored;
  const browser = navigator.language?.toLowerCase() || "";
  if (browser.startsWith("mr")) return "mr";
  return "en";
}

export function setStoredLang(lang: AppLang) {
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang === "mr" ? "mr" : "en";
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    mr: { translation: mr },
  },
  lng: getStoredLang(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false,
});

setStoredLang(getStoredLang());

i18n.on("languageChanged", (lng) => {
  if (lng === "en" || lng === "mr") setStoredLang(lng);
});

export default i18n;
