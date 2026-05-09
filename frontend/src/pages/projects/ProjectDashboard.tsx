import { NavLink, Outlet, useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProjectDashboard() {
  const { projectId } = useParams();
  const location = useLocation();

  const [project, setProject] = useState<{
    name: string;
    status: string;
  } | null>(null);

  // Capture project data ONCE
  useEffect(() => {
    if (location.state?.projectName) {
      setProject({
        name: location.state.projectName,
        status: location.state.projectStatus,
      });
    }
  }, [location.state]);

  return (
    <div className="project-dashboard">
      {/* Header */}
      <div className="project-header">
        <NavLink to="/dashboard/projects" className="back-to-projects">
          ← Projects
        </NavLink>

        <div className="project-title">
          <h2>{project?.name ?? "Project"}</h2>
          {project?.status && (
            <span className={`project-status ${project.status.toLowerCase()}`}>
              {project.status}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="project-tabs">
        <NavLink to="overview">Overview</NavLink>
        <NavLink to="units">Units</NavLink>
        <NavLink to="inventory">Inventory</NavLink>
        <NavLink to="labour">Labour</NavLink>
        <NavLink to="expenses">Expenses</NavLink>
        <NavLink to="reports">Reports</NavLink>
        <NavLink to="leads">Leads</NavLink>
      </div>

      {/* 🔑 Pass project to all tabs */}
      <Outlet context={{ project }} />
    </div>
  );
}
