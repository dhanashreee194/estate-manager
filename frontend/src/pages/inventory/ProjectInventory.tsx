import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import "./inventory.css";

export default function ProjectInventory() {
  const { project } = useOutletContext<{
    project: { name: string; status: string } | null;
  }>();

  return (
    <div className="project-inventory-page">
      {/* Header */}
      <div className="project-section-header">
        <h2>Inventory – {project?.name}</h2>
        <span className={`status ${project?.status?.toLowerCase()}`}>
          {project?.status}
        </span>
      </div>

      {/* Inventory Tabs */}
      <div className="project-inventory-tabs">
        <NavLink to="stock">Stock</NavLink>
        <NavLink to="inward">Inward</NavLink>
        <NavLink to="outward">Outward</NavLink>
        <NavLink to="requirements">Requirements</NavLink>
      </div>

      {/* Tab Content */}
      <div className="project-inventory-content">
        <Outlet />
      </div>
    </div>
  );
}
