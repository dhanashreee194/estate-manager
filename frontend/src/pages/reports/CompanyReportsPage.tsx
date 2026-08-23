import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    getCompanyAnalytics()
      .then((data) => {
        console.log("📊 Company analytics received:", data);
        setAnalytics(data);
      })
      .catch(console.error);
  }, []);

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
        <h3>📊 {t("reports.companyReports")}</h3>
      </div>

      <div className="cost-grid">
        <div className="cost-card">
          <div className="cost-header">
            <span>{t("expenses.totalCost")}</span>
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

        <div className="cost-card">
          <div className="cost-header">
            <span>{t("expenses.material")}</span>
            <span className="cost-value">₹ {analytics?.materialCost ?? 0}</span>
          </div>

          <Chart data={cumulativeData} color="#38bdf8" />
        </div>

        <div className="cost-card">
          <div className="cost-header">
            <span>{t("expenses.labour")}</span>
            <span className="cost-value">₹ {analytics?.labourCost ?? 0}</span>
          </div>

          <Chart data={cumulativeData} color="#f59e0b" />
        </div>

        <div className="cost-card">
          <div className="cost-header">
            <span>{t("reports.totalProjects")}</span>
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
            {t("reports.noTimeline")}
          </div>
        </div>

        <div className="cost-card">
          <div className="cost-header">
            <span>{t("reports.totalEnquiries")}</span>
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
            {t("reports.noTimeline")}
          </div>
        </div>

        <div className="cost-card">
          <div className="cost-header">
            <span>{t("reports.convertedLeads")}</span>
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
            {t("reports.noTimeline")}
          </div>
        </div>

        <div className="cost-card">
          <div className="cost-header">
            <span>{t("reports.conversionRate")}</span>
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
            {t("reports.noTimeline")}
          </div>
        </div>
      </div>
    </div>
  );
}
