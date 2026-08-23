import { useTranslation } from "react-i18next";

export default function UnitOverview({ analytics }: any) {
  const { t } = useTranslation();
  const unitData = analytics?.unitOverview || {};

  console.log("🏢 UnitOverview received analytics:", analytics);
  console.log("🏗️ UnitOverview calculated unitData:", unitData);

  return (
    <div className="overview-card">
      <h4>{t("projects.unitsOverview")}</h4>

      <div className="unit-row">
        <span>{t("reports.plots")}</span>
        <span>{unitData.plots !== undefined ? unitData.plots : "25"}</span>
      </div>

      <div className="unit-row">
        <span>{t("reports.flats")}</span>
        <span>{unitData.flats !== undefined ? unitData.flats : "80"}</span>
      </div>

      <div className="unit-row">
        <span>{t("reports.villas")}</span>
        <span>{unitData.villas !== undefined ? unitData.villas : "15"}</span>
      </div>
    </div>
  );
}
