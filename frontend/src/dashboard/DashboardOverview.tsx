import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AdminDashboardData } from "./dashboard";
import { getAdminDashboard } from "../api/dashboard";
import "./dashboard.css";

export default function DashboardOverview() {
  const { t } = useTranslation();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ✅ ALWAYS run hooks at top level
  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await getAdminDashboard();
        // setData(res);
        setData({
          ...res,
          activities: [
            {
              type: "project",
              message: "Project “Green Valley” created",
              time: "2 hours ago",
            },
            {
              type: "payment",
              message: "₹5,00,000 payment received",
              time: "Yesterday",
            },
            {
              type: "user",
              message: "Sales Manager invited",
              time: "2 days ago",
            },
          ],
        });
        console.log(res);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);
  const mockProfitChart = [
    { name: "Green Valley", value: 42, percent: 85 },
    { name: "Skyline Towers", value: 30, percent: 60 },
    { name: "Palm Residency", value: 18, percent: 35 },
  ];

  // ✅ Conditional rendering AFTER hooks
  if (loading) {
    return <div className="dashboard-loading">{t("dashboard.loading")}</div>;
  }

  if (error || !data) {
    return <div className="dashboard-error">{t("dashboard.failed")}</div>;
  }
  return (
    <>
      <div className="dashboard-content">
        {" "}
        {/* 🔑 vertical container */}
        {/* STATS */}
        <div className="stats-grid">
          <StatCard title={t("dashboard.projects")} value={data.stats?.projects ?? 0} />
          <StatCard title={t("dashboard.unitsSold")} value={data.stats?.unitsSold ?? 0} />
          <StatCard title={t("dashboard.revenue")} value={`₹${data.sales?.total ?? 0}`} />
          <StatCard title={t("dashboard.expenses")} value={`₹${data.expenses?.total ?? 0}`} />
          <StatCard title={t("dashboard.profit")} value={`₹${data.profit ?? 0}`} />
        </div>
        {/* BOTTOM SECTION */}
        <div className="dashboard-bottom">
          {/* Recent Activities */}
          <div className="activity-card">
            <h2 className="section-title">{t("dashboard.recentActivities")}</h2>
            <ul className="activity-list scrollable">
              {data.activities?.map((activity, index) => (
                <li key={index} className="activity-item">
                  <span className={`activity-dot ${activity.type}`} />
                  <div>
                    <p className="activity-text">{activity.message}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Profit Chart */}
          <div className="chart-card">
            <h2 className="section-title">{t("dashboard.topProfitable")}</h2>
            <div className="bar-chart">
              {mockProfitChart.map((item) => (
                <div key={item.name} className="bar-row">
                  <span className="bar-label">{item.name}</span>
                  <div className="bar">
                    <div
                      className="bar-fill"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <span className="bar-value">₹{item.value}L</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>
      <h2 className="stat-value">{value}</h2>
    </div>
  );
}
