export default function FinancialOverview({ analytics }: any) {
  // Use analytics data if available, otherwise show placeholder
  const financialData = analytics?.financialOverview || {};

  console.log("💰 FinancialOverview received analytics:", analytics);
  console.log("💳 FinancialOverview calculated financialData:", financialData);

  return (
    <div className="overview-card">
      <h4>Financial Snapshot</h4>

      <div className="finance-row">
        <span>Total Value</span>
        <span>
          {financialData.totalValue !== undefined
            ? `₹${financialData.totalValue} Cr`
            : "₹6.5 Cr"}
        </span>
      </div>

      <div className="finance-row">
        <span>Collected</span>
        <span className="positive">
          {financialData.collected !== undefined
            ? `₹${financialData.collected} Cr`
            : "₹4.2 Cr"}
        </span>
      </div>

      <div className="finance-row">
        <span>Pending</span>
        <span className="warning">
          {financialData.pending !== undefined
            ? `₹${financialData.pending} Cr`
            : "₹2.3 Cr"}
        </span>
      </div>
    </div>
  );
}
