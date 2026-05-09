export default function UnitOverview({ analytics }: any) {
  // Use analytics data if available, otherwise show placeholder
  const unitData = analytics?.unitOverview || {};

  console.log("🏢 UnitOverview received analytics:", analytics);
  console.log("🏗️ UnitOverview calculated unitData:", unitData);

  return (
    <div className="overview-card">
      <h4>Units Overview</h4>

      <div className="unit-row">
        <span>Plots</span>
        <span>{unitData.plots !== undefined ? unitData.plots : "25"}</span>
      </div>

      <div className="unit-row">
        <span>Flats</span>
        <span>{unitData.flats !== undefined ? unitData.flats : "80"}</span>
      </div>

      <div className="unit-row">
        <span>Villas</span>
        <span>{unitData.villas !== undefined ? unitData.villas : "15"}</span>
      </div>
    </div>
  );
}
