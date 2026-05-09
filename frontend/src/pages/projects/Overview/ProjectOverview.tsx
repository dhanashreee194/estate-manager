import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ActivityOverview from "./ActivityOverview";
import FinancialOverview from "./FinancialOverview";
import "./overview.css";
import OverviewStats from "./OverviewStats";
import UnitOverview from "./UnitOverview";
import { getProjectAnalytics } from "../../../api/projectAnalytics";

export default function ProjectOverview() {
  const { projectId } = useParams();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getProjectAnalytics(projectId!);
        console.log(
          "🔍 Analytics API Response for project",
          projectId,
          ":",
          data,
        );
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load project analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadAnalytics();
    }
  }, [projectId]);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading overview...</div>;
  }

  return (
    <div className="overview-page">
      {/* Top KPIs */}
      <OverviewStats analytics={analytics} />

      {/* Middle grid */}
      <div className="overview-grid">
        <UnitOverview analytics={analytics} />
        <FinancialOverview analytics={analytics} />
      </div>
      {/* <UnitsOverview /> */}
      {/* Bottom */}
      <ActivityOverview analytics={analytics} />
    </div>
  );
}
