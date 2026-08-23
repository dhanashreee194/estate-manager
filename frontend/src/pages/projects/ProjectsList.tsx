import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getProjects } from "../../api/project";
import { useAppDispatch } from "../../store/hooks";
import { setCurrentProjectId } from "../../store/projectSlice";
import "./projects.css";

export default function ProjectsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const handleProjectClick = (project: any) => {
    // Store the project ID in Redux
    dispatch(setCurrentProjectId(project.id));
    // Navigate to the project
    navigate(`/dashboard/projects/${project.id}/overview`, {
      state: {
        projectName: project.name,
        projectStatus: project.status,
      },
    });
  };

  if (isLoading) return <p>{t("projects.loading")}</p>;
  if (error) return <p>{t("projects.failed")}</p>;

  return (
    <div className="projects-page">
      <h2 className="page-title">{t("projects.title")}</h2>

      <div className="projects-grid">
        {data.map((project: any) => (
          <div
            key={project.id}
            className="project-card"
            onClick={() => handleProjectClick(project)}
          >
            <div className="project-card-header">
              <h3>{project.name}</h3>
              <span
                className={`status ${
                  project.status === "ACTIVE" ? "active" : "inactive"
                }`}
              >
                {t(`status.${project.status}`, {
                  defaultValue:
                    project.status === "ACTIVE"
                      ? t("common.active")
                      : project.status === "INACTIVE"
                        ? t("common.inactive")
                        : project.status,
                })}
              </span>
            </div>

            <p className="project-location">{project.location}</p>

            <div className="project-card-footer">
              <span>{t("projects.viewProject")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
