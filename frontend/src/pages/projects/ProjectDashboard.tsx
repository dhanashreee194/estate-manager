import { NavLink, Outlet, useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function ProjectDashboard() {
  const { projectId } = useParams();
  const location = useLocation();
  const { t } = useTranslation();

  const [project, setProject] = useState<{
    name: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    if (location.state?.projectName) {
      setProject({
        name: location.state.projectName,
        status: location.state.projectStatus,
      });
    }
  }, [location.state]);

  void projectId;

  return (
    <div className="project-dashboard">
      <div className="project-header">
        <NavLink to="/dashboard/projects" className="back-to-projects">
          {t("nav.backToProjects")}
        </NavLink>

        <div className="project-title">
          <h2>{project?.name ?? t("common.project")}</h2>
          {project?.status && (
            <span className={`project-status ${project.status.toLowerCase()}`}>
              {t(`status.${project.status}`, { defaultValue: project.status })}
            </span>
          )}
        </div>
      </div>

      <div className="project-tabs">
        <NavLink to="overview">{t("nav.overview")}</NavLink>
        <NavLink to="units">{t("nav.units")}</NavLink>
        <NavLink to="layout">{t("nav.layoutMap")}</NavLink>
        <NavLink to="inventory">{t("nav.inventory")}</NavLink>
        <NavLink to="labour">{t("nav.labour")}</NavLink>
        <NavLink to="expenses">{t("nav.expenses")}</NavLink>
        <NavLink to="reports">{t("nav.reports")}</NavLink>
        <NavLink to="leads">{t("nav.leads")}</NavLink>
      </div>

      <Outlet context={{ project }} />
    </div>
  );
}
