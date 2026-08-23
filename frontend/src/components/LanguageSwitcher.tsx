import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, type AppLang } from "../i18n";
import "./language-switcher.css";

type Props = {
  compact?: boolean;
  className?: string;
};

export default function LanguageSwitcher({ compact, className }: Props) {
  const { i18n, t } = useTranslation();
  const current = (i18n.language?.startsWith("mr") ? "mr" : "en") as AppLang;

  return (
    <div className={`lang-switcher ${compact ? "compact" : ""} ${className || ""}`}>
      {!compact && <span className="lang-label">{t("common.language")}</span>}
      <select
        aria-label={t("common.language")}
        value={current}
        onChange={(e) => i18n.changeLanguage(e.target.value as AppLang)}
      >
        {SUPPORTED_LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native}
          </option>
        ))}
      </select>
    </div>
  );
}
