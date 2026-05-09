import { useState, useEffect } from "react";
import { getCompanyAnalytics } from "../../api/companyReports";
import { getProjectAnalytics } from "../../api/projectAnalytics";
import { getProjects } from "../../api/project";
import { getKanbanLeads } from "../../api/lead";
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
          "Project Summary Report",
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
          "Financial Report",
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
        exportToPDF(leadData, "lead-report", headers, "Lead Conversion Report");
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
          "Inventory Report",
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
        📥 Export ▼
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
            📑 PDF
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div style={{ padding: 20 }}>Loading comprehensive reports...</div>;
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h3>📊 Comprehensive Reports</h3>
        <p>
          Detailed insights and analytics for your estate management business
        </p>
      </div>

      <div className="report-tabs">
        <button
          className={activeTab === "summary" ? "active" : ""}
          onClick={() => setActiveTab("summary")}
        >
          📋 Summary
        </button>
        <button
          className={activeTab === "financial" ? "active" : ""}
          onClick={() => setActiveTab("financial")}
        >
          💰 Financial
        </button>
        <button
          className={activeTab === "leads" ? "active" : ""}
          onClick={() => setActiveTab("leads")}
        >
          🎯 Leads
        </button>
        <button
          className={activeTab === "inventory" ? "active" : ""}
          onClick={() => setActiveTab("inventory")}
        >
          📦 Inventory
        </button>
      </div>

      {activeTab === "summary" && (
        <div className="report-section">
          <div className="report-header">
            <h4>Project Summary Report</h4>
            <ExportDropdown
              reportType="summary"
              onExport={exportProjectSummary}
            />
          </div>

          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Total Units</th>
                  <th>Booked</th>
                  <th>Available</th>
                  <th>Revenue (₹)</th>
                  <th>Total Cost (₹)</th>
                  <th>Enquiries</th>
                  <th>Conversion Rate (%)</th>
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
                          {project.status}
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
              <h5>Total Projects</h5>
              <p>{reportData.projects.length}</p>
            </div>
            <div className="summary-card">
              <h5>Total Revenue</h5>
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
              <h5>Total Cost</h5>
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
              <h5>Total Leads</h5>
              <p>{reportData.leads.length}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "financial" && (
        <div className="report-section">
          <div className="report-header">
            <h4>Financial Report</h4>
            <ExportDropdown
              reportType="financial"
              onExport={exportFinancialReport}
            />
          </div>

          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Total Cost (₹)</th>
                  <th>Material Cost (₹)</th>
                  <th>Labour Cost (₹)</th>
                  <th>Other Cost (₹)</th>
                  <th>Revenue (₹)</th>
                  <th>Profit/Loss (₹)</th>
                  <th>Budget (₹)</th>
                  <th>Budget Utilization (%)</th>
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
            <h4>Lead Conversion Report</h4>
            <ExportDropdown reportType="leads" onExport={exportLeadReport} />
          </div>

          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Project</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.leads.slice(0, 50).map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.name}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.email}</td>
                    <td>{lead.source}</td>
                    <td>₹{lead.budget?.toLocaleString() || "N/A"}</td>
                    <td>
                      <span
                        className={`status-badge ${lead.status.toLowerCase()}`}
                      >
                        {lead.status}
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
              Showing first 50 leads. Export to CSV for complete data.
            </p>
          )}
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="report-section">
          <div className="report-header">
            <h4>Inventory Report</h4>
            <ExportDropdown
              reportType="inventory"
              onExport={exportInventoryReport}
            />
          </div>

          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Total Units</th>
                  <th>Plots</th>
                  <th>Flats</th>
                  <th>Villas</th>
                  <th>Booked Units</th>
                  <th>Available Units</th>
                  <th>Occupancy Rate (%)</th>
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
