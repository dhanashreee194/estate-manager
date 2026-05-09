import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getReports, getReportById } from "../../../api/report";
import DailyReportModal from "./DailyReportModal";

import "../projects.css";
import { getProjectAnalytics } from "../../../api/projectAnalytics";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export default function ReportsPage() {
  const { projectId } = useParams();

  const [reports, setReports] = useState<any[]>([]);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState<"daily" | "monthly" | "range">(
    "daily",
  );
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [month, setMonth] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [analytics, setAnalytics] = useState<any>(null);

  const generateTimeline = () => {
    const days = 7; // last 7 days
    const result = [];

    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const key = d.toISOString().split("T")[0];

      result.push({
        date: key,
        amount: analytics?.timeline?.[key] || 0,
      });
    }

    return result;
  };

  const timelineData = generateTimeline();
  console.log("Analytics:", analytics);
  console.log("timeline:", timelineData);
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!projectId || !token) return; // ✅ FIX

    getProjectAnalytics(projectId).then(setAnalytics).catch(console.error);
  }, [projectId]);
  const load = async () => {
    if (!projectId) return;

    const data = await getReports(projectId);

    setReports(data);
    setAllReports(data); // ✅ save original
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const fetchReports = async () => {
    try {
      const data = await getReports(projectId!);
      setReports(data);
    } catch (err) {
      console.error(err);
    }
  };

  const changeFilterType = (type: "daily" | "monthly" | "range") => {
    setFilterType(type);

    // Reset all filters
    setSelectedDate("");
    setMonth("");
    setFromDate("");
    setToDate("");

    // Reset list to original
    setReports(allReports);
  };

  const applyFilter = () => {
    let filtered = [...allReports];

    if (filterType === "daily" && selectedDate) {
      filtered = filtered.filter((r: any) => r.date.startsWith(selectedDate));
    }

    if (filterType === "monthly" && month) {
      filtered = filtered.filter((r: any) => r.date.startsWith(month));
    }

    if (filterType === "range" && fromDate && toDate) {
      filtered = filtered.filter((r: any) => {
        return r.date >= fromDate && r.date <= toDate;
      });
    }

    setReports(filtered);
  };

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="page-header">
        <h3>📋 Daily Reports</h3>

        <button className="primary-btn" onClick={() => setOpen(true)}>
          + Add Report
        </button>
      </div>

      {/* <div className="cost-grid">
        <div className="cost-card">
          <div className="cost-header">
            <span>Total Cost</span>
            <span className="cost-value">₹ {analytics?.totalCost ?? 0}</span>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />

              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tickFormatter={(value) => {
                  const d = new Date(value);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis stroke="#6b7280" tickFormatter={(v) => `₹${v}`} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="cost-card">
          <div className="cost-header">
            <span>Material</span>
            <span className="cost-value">₹ {analytics?.materialCost}</span>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />

              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tickFormatter={(value) => {
                  const d = new Date(value);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis stroke="#6b7280" tickFormatter={(v) => `₹${v}`} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="cost-card">
          <div className="cost-header">
            <span>Labour</span>
            <span className="cost-value">₹ {analytics?.labourCost}</span>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />

              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tickFormatter={(value) => {
                  const d = new Date(value);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis stroke="#6b7280" tickFormatter={(v) => `₹${v}`} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="cost-card">
          <div className="cost-header">
            <span>Cost / SqFt</span>
            <span className="cost-value">
              ₹ {analytics?.costPerSqFt?.toFixed(2)}
            </span>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />

              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tickFormatter={(value) => {
                  const d = new Date(value);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis stroke="#6b7280" tickFormatter={(v) => `₹${v}`} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="cost-card">
          <div className="cost-header">
            <span>Today's Enquiries</span>
            <span className="cost-value">{analytics?.todayEnquiries ?? 0}</span>
          </div>
        </div>

        <div className="cost-card">
          <div className="cost-header">
            <span>Total Leads</span>
            <span className="cost-value">{analytics?.totalEnquiries ?? 0}</span>
          </div>
        </div>
      </div> */}
      <div className="report-filters">
        {/* Filter Type Buttons */}
        <div className="filter-tabs">
          <button
            className={filterType === "daily" ? "active" : ""}
            onClick={() => changeFilterType("daily")}
          >
            Daily
          </button>

          <button
            className={filterType === "monthly" ? "active" : ""}
            onClick={() => changeFilterType("monthly")}
          >
            Monthly
          </button>

          <button
            className={filterType === "range" ? "active" : ""}
            onClick={() => changeFilterType("range")}
          >
            Custom
          </button>
        </div>

        {/* Inputs */}

        {filterType === "daily" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        )}

        {filterType === "monthly" && (
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        )}

        {filterType === "range" && (
          <>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </>
        )}

        <button className="apply-btn" onClick={applyFilter}>
          Apply
        </button>
      </div>

      {/* Reports List */}

      <div className="report-list">
        {reports.length === 0 && <p className="muted">No reports added yet</p>}

        {reports.map((r) => (
          <div
            key={r.id}
            className="report-card"
            onClick={async () => {
              const full = await getReportById(r.id);
              setSelectedReport(full);
              setOpen(true);
            }}
          >
            <div className="report-top">
              <b>{new Date(r.date).toDateString()}</b>
              <span>{r.labours.length} Labours</span>
            </div>

            <p>{r.workDetails}</p>

            <div className="report-footer">
              <span>🧱 {r.materials.length} Materials</span>
              <span>💰 {r.payments.length} Payments</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}

      {open && (
        <DailyReportModal
          projectId={projectId!}
          report={selectedReport} // ✅ pass report
          onClose={() => {
            setOpen(false);
            setSelectedReport(null);
          }}
          onSaved={fetchReports}
        />
      )}
    </div>
  );
}
