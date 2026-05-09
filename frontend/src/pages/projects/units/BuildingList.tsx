import { useState } from "react";
import { useAppSelector } from "../../../store/hooks";
import UnitEditModal from "./UnitEditModal";

export default function BuildingList({
  buildings,
  units,
  onAddFlat,
}: {
  buildings: any[];
  units: any[];
  onAddFlat: (wingId: string) => void;
}) {
  const projectId = useAppSelector((state) => state.project.currentProjectId);
  const [editingBuilding, setEditingBuilding] = useState<any | null>(null);
  const [editingWing, setEditingWing] = useState<any | null>(null);
  const [editingFlat, setEditingFlat] = useState<any | null>(null);

  if (!buildings.length) return null;

  return (
    <>
      <section className="unit-section">
        <h4>Buildings</h4>

        {buildings.map((building) => {
          const wings = building.wings || [];

          return (
            <div key={building.id} className="building-card">
              {/* Building Header */}
              <div className="building-header">
                <div>
                  <strong>{building.name}</strong>
                  {building.facing && (
                    <span className="muted">Facing {building.facing}</span>
                  )}
                </div>
                <button
                  className="icon-btn edit"
                  onClick={() => setEditingBuilding(building)}
                  title="Edit Building"
                >
                  ✎
                </button>
              </div>

              {wings.length === 0 && (
                <div className="empty-text">No wings added</div>
              )}

              {wings.map((wing: any) => {
                const flats = units.filter(
                  (u) => u.unitType === "FLAT" && u.wingId === wing.id,
                );

                return (
                  <div key={wing.id} className="wing-card">
                    <div className="wing-header">
                      <div>
                        ▸ Wing <strong>{wing.name}</strong>
                        <span className="muted">
                          {" "}
                          · {wing.totalFloors} Floors
                        </span>
                      </div>

                      <div className="wing-actions">
                        <button
                          className="icon-btn edit small"
                          onClick={() => setEditingWing(wing)}
                          title="Edit Wing"
                        >
                          ✎
                        </button>
                        <button
                          className="secondary-btn small-btn"
                          onClick={() => onAddFlat(wing.id)}
                        >
                          + Flat
                        </button>
                      </div>
                    </div>

                    {flats.length === 0 ? (
                      <div className="empty-text">No flats added</div>
                    ) : (
                      <div className="flat-grid">
                        {flats.map((flat) => (
                          <div
                            key={flat.id}
                            className={`flat-card ${flat.status?.toLowerCase()}`}
                          >
                            <div className="flat-title">
                              <span>Flat {flat.unitNumber}</span>
                              <button
                                className="icon-btn edit small"
                                onClick={() => setEditingFlat(flat)}
                                title="Edit Flat"
                              >
                                ✎
                              </button>
                            </div>

                            <div className="flat-meta">
                              {flat.areaSqFt} sq ft
                              {flat.bhk && ` · ${flat.bhk} BHK`}
                            </div>

                            <span
                              className={`status-badge ${flat.status?.toLowerCase()}`}
                            >
                              {flat.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>

      {/* Modals */}
      {editingBuilding && projectId && (
        <UnitEditModal
          type="BUILDING"
          unit={editingBuilding}
          projectId={projectId}
          onClose={() => setEditingBuilding(null)}
        />
      )}

      {editingWing && projectId && (
        <UnitEditModal
          type="WING"
          unit={editingWing}
          projectId={projectId}
          onClose={() => setEditingWing(null)}
        />
      )}

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
