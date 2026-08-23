import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../store/hooks";
import UnitEditModal from "./UnitEditModal";

export default function PlotList({ units }: { units: any[] }) {
  const { t } = useTranslation();
  const projectId = useAppSelector((state) => state.project.currentProjectId);
  const [editingPlot, setEditingPlot] = useState<any | null>(null);

  const plots = units.filter((u) => u.unitType === "PLOT");
  if (!plots.length) return null;
  return (
    <>
      <section className="unit-section">
        <h4>Plots</h4>

        <div className="unit-grid">
          {plots.map((plot) => (
            <div key={plot.id} className="unit-card">
              <div className="card-header">
                <h5>Name : {plot.unitNumber}</h5>
                <div className="card-actions">
                  {projectId && plot.status === "AVAILABLE" && (
                    <Link
                      className="secondary-btn"
                      to={`/dashboard/marketing?projectId=${projectId}&unitId=${plot.id}`}
                      title={t("marketing.promote")}
                    >
                      {t("marketing.promote")}
                    </Link>
                  )}
                  <button
                    className="icon-btn edit"
                    onClick={() => setEditingPlot(plot)}
                    title="Edit"
                  >
                    ✎
                  </button>
                </div>
              </div>
              <p>Area : {plot.areaSqFt} sq ft</p>
              <p>Base Price : {plot.basePrice}</p>

              <span
                className={`status ${
                  plot.status === "AVAILABLE" ? "available" : "sold"
                }`}
              >
                {plot.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {editingPlot && projectId && (
        <UnitEditModal
          type="PLOT"
          unit={editingPlot}
          projectId={projectId}
          onClose={() => setEditingPlot(null)}
        />
      )}
    </>
  );
}
