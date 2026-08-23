import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ActivityOverview from "./ActivityOverview";
import FinancialOverview from "./FinancialOverview";
import "./overview.css";
import OverviewStats from "./OverviewStats";
import UnitOverview from "./UnitOverview";
import { getProjectAnalytics } from "../../../api/projectAnalytics";

export default function ProjectOverview() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getProjectAnalytics(projectId!);
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
    return <div style={{ padding: 20 }}>{t("projects.loadingOverview")}</div>;
  }

  return (
    <div className="overview-page">
      {projectId && (
        <div style={{ marginBottom: 12 }}>
          <Link
            className="secondary-btn"
            to={`/dashboard/marketing?projectId=${projectId}`}
          >
            {t("marketing.promoteProject")}
          </Link>
        </div>
      )}
      <OverviewStats analytics={analytics} />

      <div className="overview-grid">
        <UnitOverview analytics={analytics} />
        <FinancialOverview analytics={analytics} />
      </div>

      <ActivityOverview analytics={analytics} />
    </div>
  );
}
