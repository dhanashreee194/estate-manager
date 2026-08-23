import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./inventory.css";

export default function ProjectInventory() {
  const { t } = useTranslation();
  const { project } = useOutletContext<{
    project: { name: string; status: string } | null;
  }>();

  return (
    <div className="project-inventory-page">
      <div className="project-section-header">
        <h2>
          {t("nav.inventory")} – {project?.name}
        </h2>
        <span className={`status ${project?.status?.toLowerCase()}`}>
          {t(`status.${project?.status}`, {
            defaultValue:
              project?.status === "ACTIVE"
                ? t("common.active")
                : project?.status === "INACTIVE"
                  ? t("common.inactive")
                  : project?.status,
          })}
        </span>
      </div>

      <div className="project-inventory-tabs">
        <NavLink to="stock">{t("inventory.stock")}</NavLink>
        <NavLink to="inward">{t("inventory.inward")}</NavLink>
        <NavLink to="outward">{t("inventory.outward")}</NavLink>
        <NavLink to="requirements">{t("inventory.requirements")}</NavLink>
      </div>

      <div className="project-inventory-content">
        <Outlet />
      </div>
    </div>
  );
}
