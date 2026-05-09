import { useState } from "react";
import { useAppSelector } from "../../../store/hooks";
import UnitEditModal from "./UnitEditModal";

export default function FlatGrid({ flats }: { flats: any[] }) {
  const projectId = useAppSelector((state) => state.project.currentProjectId);
  const [editingFlat, setEditingFlat] = useState<any | null>(null);

  if (!flats.length) return null;

  return (
    <>
      <section className="unit-section">
        <h4>Flats</h4>

        <div className="flat-grid">
          {flats.map((flat) => (
            <div
              key={flat.id}
              className={`flat-card ${flat.isAvailable ? "available" : "sold"}`}
            >
              <div className="flat-title">
                <span>
                  {flat.name} {flat.bhk ? `(${flat.bhk} BHK)` : ""}
                </span>
                <button
                  className="icon-btn small"
                  onClick={() => setEditingFlat(flat)}
                  title="Edit"
                >
                  ✎
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {editingFlat && projectId && (
        <UnitEditModal
          type="FLAT"
          unit={editingFlat}
          projectId={projectId}
          onClose={() => setEditingFlat(null)}
        />
      )}
    </>
  );
}
