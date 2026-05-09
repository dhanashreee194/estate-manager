export default function ActivityOverview({ analytics }: any) {
  // Use analytics data if available, otherwise show placeholder
  const activities = analytics?.recentActivity || [
    "🏠 Flat A-302 booked",
    "💰 ₹5,00,000 payment received",
    "👷 Labour attendance marked today",
  ];

  console.log("📋 ActivityOverview received analytics:", analytics);
  console.log("🔄 ActivityOverview calculated activities:", activities);

  return (
    <div className="overview-card">
      <h4>Recent Activity</h4>

      <ul className="activity-list">
        {activities.map((activity: string, index: number) => (
          <li key={index}>{activity}</li>
        ))}
      </ul>
    </div>
  );
}
