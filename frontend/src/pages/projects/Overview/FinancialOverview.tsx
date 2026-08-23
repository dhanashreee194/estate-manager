import { useTranslation } from "react-i18next";

export default function FinancialOverview({ analytics }: any) {
  const { t } = useTranslation();
  const financialData = analytics?.financialOverview || {};

  console.log("💰 FinancialOverview received analytics:", analytics);
  console.log("💳 FinancialOverview calculated financialData:", financialData);

  return (
    <div className="overview-card">
      <h4>{t("projects.financialSnapshot")}</h4>

      <div className="finance-row">
        <span>{t("expenses.totalValue")}</span>
        <span>
          {financialData.totalValue !== undefined
            ? `₹${financialData.totalValue} Cr`
            : "₹6.5 Cr"}
        </span>
      </div>

      <div className="finance-row">
        <span>{t("common.collected")}</span>
        <span className="positive">
          {financialData.collected !== undefined
            ? `₹${financialData.collected} Cr`
            : "₹4.2 Cr"}
        </span>
      </div>

      <div className="finance-row">
        <span>{t("common.pending")}</span>
        <span className="warning">
          {financialData.pending !== undefined
            ? `₹${financialData.pending} Cr`
            : "₹2.3 Cr"}
        </span>
      </div>
    </div>
  );
}
