import { useState } from "react";
import { useAppSelector } from "../../../store/hooks";
import BulkFlatCreateModal from "./BulkFlatCreateModal";
import UnitEditModal from "./UnitEditModal";

export default function WingList({
  wings,
  projectId,
}: {
  wings: any[];
  projectId: string;
}) {
  const reduxProjectId = useAppSelector(
    (state) => state.project.currentProjectId,
  );
  const [bulkWingId, setBulkWingId] = useState<string | null>(null);
  const [editingWing, setEditingWing] = useState<any | null>(null);

  const finalProjectId = projectId || reduxProjectId;

  if (!wings.length) return null;

  return (
    <>
      <section className="unit-section">
        <h4>Wings</h4>

        <div className="unit-grid">
          {wings.map((w) => (
            <div key={w.id} className="unit-card">
              {/* Header */}
              <div className="unit-card-header">
                <div>
                  <h5>{w.name}</h5>
                  <span className="muted">{w.totalFloors} Floors</span>
                </div>
                <button
                  className="icon-btn edit"
                  onClick={() => setEditingWing(w)}
                  title="Edit"
                >
                  ✎
                </button>
              </div>

              {/* Meta */}
              <div className="unit-meta">
                {w.hasLift && <div>🛗 Lift: {w.liftsCount || 1}</div>}
              </div>

              {/* Actions */}
              <div className="unit-actions">
                {/* Single Flat */}
                <button className="secondary-btn small">+ Flat</button>

                {/* Bulk Flats */}
                <button
                  className="primary-btn small"
                  onClick={() => setBulkWingId(w.id)}
                >
                  + Bulk Flats
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Modal */}
        {bulkWingId && (
          <BulkFlatCreateModal
            wingId={bulkWingId}
            onClose={() => setBulkWingId(null)}
          />
        )}
      </section>

      {/* Edit Modal */}
      {editingWing && finalProjectId && (
        <UnitEditModal
          type="WING"
          unit={editingWing}
          projectId={finalProjectId}
          onClose={() => setEditingWing(null)}
        />
      )}
    </>
  );
}
