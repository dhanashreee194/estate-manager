import { useTranslation } from "react-i18next";

export default function OverviewStats({ analytics }: any) {
  const { t } = useTranslation();
  const stats = analytics?.overviewStats || {};

  console.log("📊 OverviewStats received analytics:", analytics);
  console.log("📈 OverviewStats calculated stats:", stats);

  return (
    <div className="overview-stats">
      <div className="stat-card">
        <span className="stat-label">{t("projects.totalUnits")}</span>
        <span className="stat-value">
          {stats.totalUnits !== undefined ? stats.totalUnits : "120"}
        </span>
      </div>

      <div className="stat-card">
        <span className="stat-label">{t("projects.booked")}</span>
        <span className="stat-value positive">
          {stats.booked !== undefined ? stats.booked : "72"}
        </span>
      </div>

      <div className="stat-card">
        <span className="stat-label">{t("projects.available")}</span>
        <span className="stat-value">
          {stats.available !== undefined ? stats.available : "38"}
        </span>
      </div>

      <div className="stat-card">
        <span className="stat-label">{t("projects.revenue")}</span>
        <span className="stat-value">
          {stats.revenue !== undefined ? `₹${stats.revenue} Cr` : "₹4.2 Cr"}
        </span>
      </div>
    </div>
  );
}
