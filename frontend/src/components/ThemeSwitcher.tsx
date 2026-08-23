import { useTranslation } from "react-i18next";
import { useTheme, type AppTheme } from "../theme/ThemeProvider";
import "./theme-switcher.css";

type Props = {
  compact?: boolean;
  className?: string;
};

export default function ThemeSwitcher({ compact, className }: Props) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`theme-switcher ${compact ? "compact" : ""} ${className || ""}`}
    >
      {!compact && <span className="theme-label">{t("common.theme")}</span>}
      <select
        aria-label={t("common.theme")}
        value={theme}
        onChange={(e) => setTheme(e.target.value as AppTheme)}
      >
        <option value="dark">{t("common.themeDark")}</option>
        <option value="light">{t("common.themeLight")}</option>
      </select>
    </div>
  );
}
