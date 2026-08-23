import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getCompanyAnalytics } from "../../api/companyReports";
import { getProjectAnalytics } from "../../api/projectAnalytics";
import { getProjects } from "../../api/project";
import { getKanbanLeads } from "../../api/lead";
import { leadSourceLabel } from "../../constants/leadSources";
import {
  exportToCSV,
  exportToJSON,
  exportToExcel,
  exportToPDF,
  transformProjectSummary,
  transformFinancialData,
  transformLeadData,
  transformInventoryData,
} from "../../utils/exportUtils";
import "./reports.css";

interface ReportData {
  companyAnalytics: any;
  projects: any[];
  leads: any[];
  projectAnalytics: Record<string, any>;
}

export default function ComprehensiveReports() {
  const { t } = useTranslation();
  const [reportData, setReportData] = useState<ReportData>({
    companyAnalytics: null,
    projects: [],
    leads: [],
    projectAnalytics: {},
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");
  const [showExportMenu, setShowExportMenu] = useState<string | null>(null);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const [companyAnalytics, projects, leads] = await Promise.all([
        getCompanyAnalytics(),
        getProjects(),
        getKanbanLeads(),
      ]);

      // Get analytics for each project
      const projectAnalytics: Record<string, any> = {};
      for (const project of projects) {
        try {
          projectAnalytics[project.id] = await getProjectAnalytics(project.id);
        } catch (err) {
          console.error(
            `Failed to load analytics for project ${project.id}:`,
            err,
          );
        }
      }

      setReportData({
        companyAnalytics,
        projects,
        leads: Object.values(leads).flat(),
        projectAnalytics,
      });
    } catch (error) {
      console.error("Failed to load report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportProjectSummary = (format: "csv" | "excel" | "json" | "pdf") => {
    const summaryData = transformProjectSummary(
      reportData.projects,
      reportData.projectAnalytics,
    );
    const headers = Object.keys(summaryData[0] || {});

    switch (format) {
      case "csv":
        exportToCSV(summaryData, "project-summary", headers);
        break;
      case "excel":
        exportToExcel(summaryData, "project-summary", headers);
        break;
      case "json":
        exportToJSON(summaryData, "project-summary");
        break;
      case "pdf":
        exportToPDF(
          summaryData,
          "project-summary",
          headers,
          t("reports.projectSummary"),
        );
        break;
    }
  };

  const exportFinancialReport = (format: "csv" | "excel" | "json" | "pdf") => {
    const financialData = transformFinancialData(
      reportData.projects,
      reportData.projectAnalytics,
    );
    const headers = Object.keys(financialData[0] || {});

    switch (format) {
      case "csv":
        exportToCSV(financialData, "financial-report", headers);
        break;
      case "excel":
        exportToExcel(financialData, "financial-report", headers);
        break;
      case "json":
        exportToJSON(financialData, "financial-report");
        break;
      case "pdf":
        exportToPDF(
          financialData,
          "financial-report",
          headers,
          t("reports.financialReport"),
        );
        break;
    }
  };

  const exportLeadReport = (format: "csv" | "excel" | "json" | "pdf") => {
    const leadData = transformLeadData(reportData.leads, reportData.projects);
    const headers = Object.keys(leadData[0] || {});

    switch (format) {
      case "csv":
        exportToCSV(leadData, "lead-report", headers);
        break;
      case "excel":
        exportToExcel(leadData, "lead-report", headers);
        break;
      case "json":
        exportToJSON(leadData, "lead-report");
        break;
      case "pdf":
        exportToPDF(leadData, "lead-report", headers, t("reports.leadConversion"));
        break;
    }
  };

  const exportInventoryReport = (format: "csv" | "excel" | "json" | "pdf") => {
    const inventoryData = transformInventoryData(
      reportData.projects,
      reportData.projectAnalytics,
    );
    const headers = Object.keys(inventoryData[0] || {});

    switch (format) {
      case "csv":
        exportToCSV(inventoryData, "inventory-report", headers);
        break;
      case "excel":
        exportToExcel(inventoryData, "inventory-report", headers);
        break;
      case "json":
        exportToJSON(inventoryData, "inventory-report");
        break;
      case "pdf":
        exportToPDF(
          inventoryData,
          "inventory-report",
          headers,
          t("reports.inventoryReport"),
        );
        break;
    }
  };

  const ExportDropdown = ({
    reportType,
    onExport,
  }: {
    reportType: string;
    onExport: (format: "csv" | "excel" | "json" | "pdf") => void;
  }) => (
    <div className="export-dropdown">
      <button
        className="export-btn"
        onClick={() =>
          setShowExportMenu(showExportMenu === reportType ? null : reportType)
        }
      >
        📥 {t("common.download")} ▼
      </button>
      {showExportMenu === reportType && (
        <div className="export-menu">
          <button
            onClick={() => {
              onExport("csv");
              setShowExportMenu(null);
            }}
          >
            📄 CSV
          </button>
          <button
            onClick={() => {
              onExport("excel");
              setShowExportMenu(null);
            }}
          >
            📊 Excel
          </button>
          <button
            onClick={() => {
              onExport("json");
              setShowExportMenu(null);
            }}
          >
            📋 JSON
          </button>
          <button
            onClick={() => {
              onExport("pdf");
              setShowExportMenu(null);
            }}
          >
            📑 {t("common.pdf")}
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div style={{ padding: 20 }}>{t("reports.loadingComprehensive")}</div>;
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h3>📊 {t("nav.advancedReports")}</h3>
        <p>{t("reports.comprehensiveHint")}</p>
      </div>

      <div className="report-tabs">
        <button
          className={activeTab === "summary" ? "active" : ""}
          onClick={() => setActiveTab("summary")}
        >
          📋 {t("reports.summary")}
        </button>
        <button
          className={activeTab === "financial" ? "active" : ""}
          onClick={() => setActiveTab("financial")}
        >
          💰 {t("reports.financial")}
        </button>
        <button
          className={activeTab === "leads" ? "active" : ""}
          onClick={() => setActiveTab("leads")}
        >
          🎯 {t("reports.leads")}
        </button>
        <button
          className={activeTab === "inventory" ? "active" : ""}
          onClick={() => setActiveTab("inventory")}
        >
          📦 {t("reports.inventory")}
        </button>
      </div>

      {activeTab === "summary" && (
        <div className="report-section">
          <div className="report-header">
            <h4>{t("reports.projectSummary")}</h4>
            <ExportDropdown
              reportType="summary"
              onExport={exportProjectSummary}
            />
          </div>

          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>{t("createProject.name")}</th>
                  <th>{t("createProject.location")}</th>
                  <th>{t("common.status")}</th>
                  <th>{t("reports.totalUnits")}</th>
                  <th>{t("projects.booked")}</th>
                  <th>{t("projects.available")}</th>
                  <th>{t("projects.revenue")} (₹)</th>
                  <th>{t("expenses.totalCost")} (₹)</th>
                  <th>{t("reports.totalEnquiries")}</th>
                  <th>{t("reports.conversionRate")} (%)</th>
                </tr>
              </thead>
              <tbody>
                {reportData.projects.map((project) => {
                  const analytics = reportData.projectAnalytics[project.id];
                  return (
                    <tr key={project.id}>
                      <td>{project.name}</td>
                      <td>{project.location}</td>
                      <td>
                        <span
                          className={`status-badge ${project.status.toLowerCase()}`}
                        >
                          {t(`status.${project.status}`, { defaultValue: project.status })}
                        </span>
                      </td>
                      <td>{analytics?.overviewStats?.totalUnits || 0}</td>
                      <td>{analytics?.overviewStats?.booked || 0}</td>
                      <td>{analytics?.overviewStats?.available || 0}</td>
                      <td>₹{analytics?.overviewStats?.revenue || 0} Cr</td>
                      <td>₹{analytics?.totalCost?.toLocaleString() || 0}</td>
                      <td>{analytics?.totalEnquiries || 0}</td>
                      <td>{analytics?.conversionRate?.toFixed(1) || 0}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <h5>{t("reports.totalProjects")}</h5>
              <p>{reportData.projects.length}</p>
            </div>
            <div className="summary-card">
              <h5>{t("reports.totalRevenue")}</h5>
              <p>
                ₹
                {Object.values(reportData.projectAnalytics)
                  .reduce(
                    (sum: any, analytics: any) =>
                      sum + parseFloat(analytics?.overviewStats?.revenue || 0),
                    0,
                  )
                  .toFixed(1)}{" "}
                Cr
              </p>
            </div>
            <div className="summary-card">
              <h5>{t("expenses.totalCost")}</h5>
              <p>
                ₹
                {Object.values(reportData.projectAnalytics)
                  .reduce(
                    (sum: any, analytics: any) =>
                      sum + (analytics?.totalCost || 0),
                    0,
                  )
                  .toLocaleString()}
              </p>
            </div>
            <div className="summary-card">
              <h5>{t("reports.totalLeads")}</h5>
              <p>{reportData.leads.length}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "financial" && (
        <div className="report-section">
          <div className="report-header">
            <h4>{t("reports.financialReport")}</h4>
            <ExportDropdown
              reportType="financial"
              onExport={exportFinancialReport}
            />
          </div>

          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>{t("createProject.name")}</th>
                  <th>{t("expenses.totalCost")} (₹)</th>
                  <th>{t("expenses.material")} (₹)</th>
                  <th>{t("expenses.labour")} (₹)</th>
                  <th>{t("expenses.other")} (₹)</th>
                  <th>{t("projects.revenue")} (₹)</th>
                  <th>{t("dashboard.profit")} (₹)</th>
                  <th>{t("expenses.budget")} (₹)</th>
                  <th>{t("expenses.budget")} (%)</th>
                </tr>
              </thead>
              <tbody>
                {reportData.projects.map((project) => {
                  const analytics = reportData.projectAnalytics[project.id];
                  const totalCost = analytics?.totalCost || 0;
                  const materialCost = analytics?.materialCost || 0;
                  const labourCost = analytics?.labourCost || 0;
                  const otherCost = totalCost - materialCost - labourCost;
                  const revenue =
                    parseFloat(analytics?.overviewStats?.revenue || 0) *
                    10000000; // Convert Cr to ₹
                  const profitLoss = revenue - totalCost;
                  const budget = analytics?.budget || 0;
                  const budgetUtilization = budget
                    ? (totalCost / budget) * 100
                    : 0;

                  return (
                    <tr key={project.id}>
                      <td>{project.name}</td>
                      <td>₹{totalCost.toLocaleString()}</td>
                      <td>₹{materialCost.toLocaleString()}</td>
                      <td>₹{labourCost.toLocaleString()}</td>
                      <td>₹{otherCost.toLocaleString()}</td>
                      <td>₹{revenue.toLocaleString()}</td>
                      <td className={profitLoss >= 0 ? "positive" : "negative"}>
                        ₹{profitLoss.toLocaleString()}
                      </td>
                      <td>₹{budget.toLocaleString()}</td>
                      <td>{budgetUtilization.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "leads" && (
        <div className="report-section">
          <div className="report-header">
            <h4>{t("reports.leadConversion")}</h4>
            <ExportDropdown reportType="leads" onExport={exportLeadReport} />
          </div>

          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>{t("common.name")}</th>
                  <th>{t("common.phone")}</th>
                  <th>{t("common.email")}</th>
                  <th>{t("reports.source")}</th>
                  <th>{t("leads.budget")}</th>
                  <th>{t("common.status")}</th>
                  <th>{t("common.project")}</th>
                  <th>{t("reports.createdDate")}</th>
                </tr>
              </thead>
              <tbody>
                {reportData.leads.slice(0, 50).map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.name}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.email}</td>
                    <td>{leadSourceLabel(lead.source)}</td>
                    <td>₹{lead.budget?.toLocaleString() || "N/A"}</td>
                    <td>
                      <span
                        className={`status-badge ${lead.status.toLowerCase()}`}
                      >
                        {t(`status.${lead.status}`, { defaultValue: lead.status })}
                      </span>
                    </td>
                    <td>
                      {reportData.projects.find((p) => p.id === lead.projectId)
                        ?.name || "N/A"}
                    </td>
                    <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {reportData.leads.length > 50 && (
            <p className="note">
              {t("reports.showingLeads")}
            </p>
          )}
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="report-section">
          <div className="report-header">
            <h4>{t("reports.inventoryReport")}</h4>
            <ExportDropdown
              reportType="inventory"
              onExport={exportInventoryReport}
            />
          </div>

          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>{t("createProject.name")}</th>
                  <th>{t("reports.totalUnits")}</th>
                  <th>{t("reports.plots")}</th>
                  <th>{t("reports.flats")}</th>
                  <th>{t("reports.villas")}</th>
                  <th>{t("reports.bookedUnits")}</th>
                  <th>{t("reports.availableUnits")}</th>
                  <th>{t("reports.occupancyRate")}</th>
                </tr>
              </thead>
              <tbody>
                {reportData.projects.map((project) => {
                  const analytics = reportData.projectAnalytics[project.id];
                  const totalUnits = analytics?.overviewStats?.totalUnits || 0;
                  const bookedUnits = analytics?.overviewStats?.booked || 0;
                  const occupancyRate = totalUnits
                    ? (bookedUnits / totalUnits) * 100
                    : 0;

                  return (
                    <tr key={project.id}>
                      <td>{project.name}</td>
                      <td>{totalUnits}</td>
                      <td>{analytics?.unitOverview?.plots || 0}</td>
                      <td>{analytics?.unitOverview?.flats || 0}</td>
                      <td>{analytics?.unitOverview?.villas || 0}</td>
                      <td>{bookedUnits}</td>
                      <td>{analytics?.overviewStats?.available || 0}</td>
                      <td>{occupancyRate.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
