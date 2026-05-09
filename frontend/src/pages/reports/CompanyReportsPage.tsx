import { useEffect, useMemo, useState } from "react";
import { getCompanyAnalytics } from "../../api/companyReports";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import "../projects/projects.css";
import Chart from "../../components/Chart";

export default function CompanyReportsPage() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    getCompanyAnalytics()
      .then((data) => {
        console.log("📊 Company analytics received:", data);
        setAnalytics(data);
      })
      .catch(console.error);
  }, []);

  // build last 7 days timeline
  const timelineData = useMemo(() => {
    if (!analytics?.timeline) {
      console.log("📅 No timeline data available");
      return [];
    }

    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const key = d.toISOString().split("T")[0];

      result.push({
        date: key,
        amount: analytics.timeline[key] || 0,
      });
    }

    console.log("📈 Processed timeline data:", result);
    return result;
  }, [analytics]);

  // Create separate data for non-cost charts (showing cumulative data)
  const cumulativeData = useMemo(() => {
    if (!analytics?.cumulativeTimeline) {
      console.log("📅 No cumulative timeline data available");
      return [];
    }

    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const key = d.toISOString().split("T")[0];

      result.push({
        date: key,
        amount: analytics.cumulativeTimeline[key] || 0,
      });
    }

    console.log("📈 Processed cumulative data:", result);
    return result;
  }, [analytics]);

  return (
    <div className="reports-page">
      <div className="page-header">
        <h3>📊 Company Reports</h3>
      </div>

      <div className="cost-grid">
        {/* TOTAL COST */}
        <div className="cost-card">
          <div className="cost-header">
            <span>Total Cost</span>
            <span className="cost-value">₹ {analytics?.totalCost ?? 0}</span>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={timelineData}>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />

              <YAxis stroke="#6b7280" tickFormatter={(v) => `₹${v}`} />

              <Line
                dataKey="amount"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* MATERIAL */}
        <div className="cost-card">
          <div className="cost-header">
            <span>Material</span>
            <span className="cost-value">₹ {analytics?.materialCost ?? 0}</span>
          </div>

          <Chart data={cumulativeData} color="#38bdf8" />
        </div>

        {/* LABOUR */}
        <div className="cost-card">
          <div className="cost-header">
            <span>Labour</span>
            <span className="cost-value">₹ {analytics?.labourCost ?? 0}</span>
          </div>

          <Chart data={cumulativeData} color="#f59e0b" />
        </div>

        {/* PROJECTS */}
        <div className="cost-card">
          <div className="cost-header">
            <span>Total Projects</span>
            <span className="cost-value">{analytics?.totalProjects ?? 0}</span>
          </div>

          <div
            style={{
              height: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
            }}
          >
            No timeline data available
          </div>
        </div>

        {/* ENQUIRIES */}
        <div className="cost-card">
          <div className="cost-header">
            <span>Total Enquiries</span>
            <span className="cost-value">{analytics?.totalEnquiries ?? 0}</span>
          </div>

          <div
            style={{
              height: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
            }}
          >
            No timeline data available
          </div>
        </div>

        {/* CONVERTED */}
        <div className="cost-card">
          <div className="cost-header">
            <span>Converted Leads</span>
            <span className="cost-value">{analytics?.convertedLeads ?? 0}</span>
          </div>

          <div
            style={{
              height: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
            }}
          >
            No timeline data available
          </div>
        </div>

        {/* CONVERSION */}
        <div className="cost-card">
          <div className="cost-header">
            <span>Conversion Rate</span>
            <span className="cost-value">
              {analytics?.conversionRate?.toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              height: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
            }}
          >
            No timeline data available
          </div>
        </div>
      </div>
    </div>
  );
}
