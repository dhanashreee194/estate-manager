export default function OverviewStats({ analytics }: any) {
  // Use analytics data if available, otherwise show placeholder
  const stats = analytics?.overviewStats || {};

  console.log("📊 OverviewStats received analytics:", analytics);
  console.log("📈 OverviewStats calculated stats:", stats);

  return (
    <div className="overview-stats">
      <div className="stat-card">
        <span className="stat-label">Total Units</span>
        <span className="stat-value">
          {stats.totalUnits !== undefined ? stats.totalUnits : "120"}
        </span>
      </div>

      <div className="stat-card">
        <span className="stat-label">Booked</span>
        <span className="stat-value positive">
          {stats.booked !== undefined ? stats.booked : "72"}
        </span>
      </div>

      <div className="stat-card">
        <span className="stat-label">Available</span>
        <span className="stat-value">
          {stats.available !== undefined ? stats.available : "38"}
        </span>
      </div>

      <div className="stat-card">
        <span className="stat-label">Revenue</span>
        <span className="stat-value">
          {stats.revenue !== undefined ? `₹${stats.revenue} Cr` : "₹4.2 Cr"}
        </span>
      </div>
    </div>
  );
}
