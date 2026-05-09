import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../../api/project";
import { useAppDispatch } from "../../store/hooks";
import { setCurrentProjectId } from "../../store/projectSlice";
import "./projects.css";

export default function ProjectsList() {
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

  if (isLoading) return <p>Loading projects...</p>;
  if (error) return <p>Failed to load projects</p>;

  return (
    <div className="projects-page">
      <h2 className="page-title">Projects</h2>

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
                {project.status}
              </span>
            </div>

            <p className="project-location">{project.location}</p>

            <div className="project-card-footer">
              <span>View Project →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
