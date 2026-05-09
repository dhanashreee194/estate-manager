import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { createUnit, getProjectUnits } from "../../../api/unit";
import "./units.css";
import { createWing } from "../../../api/wing";
import { createBuilding, getProjectBuildings } from "../../../api/building";
import { useAppSelector } from "../../../store/hooks";

type UnitType = "PLOT" | "BUILDING" | "WING" | "FLAT" | "ROW_HOUSE";

interface Props {
  type: UnitType;
  parentUnitId?: string;
  onClose: () => void;
}

export default function UnitCreateModal({
  type,
  parentUnitId,
  onClose,
}: Props) {
  const { projectId: urlProjectId } = useParams();
  const reduxProjectId = useAppSelector(
    (state) => state.project.currentProjectId,
  );
  // Use URL projectId as primary source, fall back to Redux
  const projectId = urlProjectId || reduxProjectId;
  const qc = useQueryClient();

  const [form, setForm] = useState<any>({});

  const { data: buildings = [], isLoading: buildingsLoading } = useQuery({
    queryKey: ["buildings", projectId],
    queryFn: () => getProjectBuildings(projectId!),
    enabled: type === "WING" && !!projectId,
  });

  // Debug logs
  console.log("UnitCreateModal - projectId:", projectId);
  console.log("UnitCreateModal - buildings:", buildings);
  console.log("UnitCreateModal - buildingsLoading:", buildingsLoading);

  const mutation = useMutation({
    mutationFn: createUnit,
    /*************  ✨ Windsurf Command ⭐  *************/
    /**
   * Invalidate the units query for the project and close the modal.
/*******  e919ebe3-ba93-4e49-bf63-6bf53a8955fe  *******/
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["units", projectId] });
      onClose();
    },
    onError: (err: any) => {
      console.error("Create unit failed:", err);
      alert("Failed to create unit. Check console.");
    },
  });

  /* -------- UNIT (Plot / Flat / Row House) -------- */
  const createUnitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["units", projectId] });
      onClose();
    },
    onError: (err) => {
      console.error("Create unit failed", err);
      alert("Failed to create unit");
    },
  });

  /* -------- BUILDING -------- */
  const createBuildingMutation = useMutation({
    mutationFn: createBuilding,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["buildings", projectId] });
      onClose();
    },
    onError: (err) => {
      console.error("Create building failed", err);
      alert("Failed to create building");
    },
  });

  /* -------- WING -------- */
  const createWingMutation = useMutation({
    mutationFn: createWing,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["units", projectId] });
      onClose();
    },
    onError: (err) => {
      console.error("Create wing failed", err);
      alert("Failed to create wing");
    },
  });

  const submit = () => {
    if (!projectId) {
      alert("Project ID not found. Please select a project.");
      return;
    }

    if (type === "PLOT") {
      createUnitMutation.mutate({
        projectId,
        unitType: "PLOT",
        unitNumber: form.plotNo, // ✅ FIX
        areaSqFt: form.length * form.width, // ✅ FIX
        basePrice: form.basePrice, // ✅ FIX
        direction: form.direction,
      });
      return;
    }
    if (type === "BUILDING") {
      createBuildingMutation.mutate({
        projectId,
        name: form.name,
        facing: form.direction,
      });
      return;
    }

    if (type === "WING") {
      createWingMutation.mutate({
        buildingId: form.buildingId,
        name: form.name,
        totalFloors: form.totalFloors,
        flatsPerFloor: form.flatsPerFloor,
        hasLift: form.hasLift || false,
        autoCreateFlats: form.autoCreateFlats || false,
        flatConfig: form.autoCreateFlats
          ? {
              startFloor: form.startFloor,
              endFloor: form.endFloor,
              areaSqFt: form.areaSqFt,
              basePrice: form.basePrice,
              direction: form.direction || undefined,
              bhkType: form.bhkType || undefined,
            }
          : undefined,
      });

      return;
    }

    // ONLY sellable units below
    if (type === "FLAT") {
      createUnitMutation.mutate({
        projectId,
        unitType: "FLAT",
        unitNumber: form.flatNo, // ✅ FIX
        areaSqFt: form.areaSqFt,
        basePrice: form.price, // ✅ FIX
        direction: form.direction,
        wingId: parentUnitId, // ✅ FIX (CRITICAL)
      });
      return;
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h4>Create {type.replace("_", " ")}</h4>
        <div className="modal-content">
          {/* ---------- PLOT ---------- */}
          {type === "PLOT" && (
            <>
              <input
                className="form-control"
                placeholder="Plot No"
                onChange={(e) => setForm({ ...form, plotNo: e.target.value })}
              />
              <input
                className="form-control"
                type="number"
                placeholder="Length (ft)"
                onChange={(e) => setForm({ ...form, length: +e.target.value })}
              />
              <input
                className="form-control"
                type="number"
                placeholder="Width (ft)"
                onChange={(e) => setForm({ ...form, width: +e.target.value })}
              />
              <input
                className="form-control"
                placeholder="Gat No"
                onChange={(e) => setForm({ ...form, gatNo: e.target.value })}
              />
              <input
                className="form-control"
                type="number"
                placeholder="Base Price"
                onChange={(e) =>
                  setForm({ ...form, basePrice: +e.target.value })
                }
              />
            </>
          )}

          {/* ---------- BUILDING ---------- */}
          {type === "BUILDING" && (
            <input
              className="form-control"
              placeholder="Building Name (Tower A)"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}

          {/* ---------- WING ---------- */}
          {type === "WING" && (
            <>
              {/* Select Building */}
              <select
                className="form-control"
                value={form.buildingId || ""}
                onChange={(e) =>
                  setForm({ ...form, buildingId: e.target.value })
                }
                disabled={buildingsLoading || buildings.length === 0}
              >
                <option value="">
                  {buildingsLoading
                    ? "Loading buildings..."
                    : buildings.length === 0
                      ? "No buildings available"
                      : "Select Building"}
                </option>

                {buildings.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <input
                className="form-control"
                placeholder="Wing Name (A/B)"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                className="form-control"
                type="number"
                placeholder="Total Floors"
                onChange={(e) =>
                  setForm({ ...form, totalFloors: +e.target.value })
                }
              />

              <input
                className="form-control"
                type="number"
                placeholder="Flats Per Floor"
                onChange={(e) =>
                  setForm({ ...form, flatsPerFloor: +e.target.value })
                }
              />

              {/* Has Lift Toggle */}
              <div className="toggle-container">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={form.hasLift || false}
                    onChange={(e) =>
                      setForm({ ...form, hasLift: e.target.checked })
                    }
                    className="toggle-checkbox"
                  />
                  <span className="toggle-text">
                    {form.hasLift ? "With Lift" : "Without Lift"}
                  </span>
                </label>
                <p className="toggle-hint">
                  {form.hasLift
                    ? "This wing has elevator access"
                    : "This wing does not have an elevator"}
                </p>
              </div>

              {/* Auto Create Flats Toggle */}
              <div className="toggle-container">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={form.autoCreateFlats || false}
                    onChange={(e) =>
                      setForm({ ...form, autoCreateFlats: e.target.checked })
                    }
                    className="toggle-checkbox"
                  />
                  <span className="toggle-text">
                    {form.autoCreateFlats
                      ? "Auto Create All Flats"
                      : "Create Flats Manually"}
                  </span>
                </label>
                <p className="toggle-hint">
                  {form.autoCreateFlats
                    ? "Flats will be automatically created for all floors"
                    : "Add flats individually later"}
                </p>
              </div>

              {/* Bulk Flat Settings */}
              {form.autoCreateFlats && (
                <>
                  <div className="bulk-flat-section">
                    <h5>Bulk Flat Configuration</h5>

                    <input
                      className="form-control"
                      type="number"
                      placeholder="Start Floor"
                      onChange={(e) =>
                        setForm({ ...form, startFloor: +e.target.value })
                      }
                    />

                    <input
                      className="form-control"
                      type="number"
                      placeholder="End Floor"
                      onChange={(e) =>
                        setForm({ ...form, endFloor: +e.target.value })
                      }
                    />

                    <input
                      className="form-control"
                      type="number"
                      placeholder="Area (Sq Ft)"
                      onChange={(e) =>
                        setForm({ ...form, areaSqFt: +e.target.value })
                      }
                    />

                    <input
                      className="form-control"
                      type="number"
                      placeholder="Base Price"
                      onChange={(e) =>
                        setForm({ ...form, basePrice: +e.target.value })
                      }
                    />

                    <select
                      className="form-control"
                      value={form.direction || ""}
                      onChange={(e) =>
                        setForm({ ...form, direction: e.target.value })
                      }
                    >
                      <option value="">Direction (Optional)</option>
                      <option value="NORTH">North</option>
                      <option value="SOUTH">South</option>
                      <option value="EAST">East</option>
                      <option value="WEST">West</option>
                    </select>

                    <select
                      className="form-control"
                      value={form.bhkType || ""}
                      onChange={(e) =>
                        setForm({ ...form, bhkType: e.target.value })
                      }
                    >
                      <option value="">BHK Type (Optional)</option>
                      <option value="1BHK">1 BHK</option>
                      <option value="2BHK">2 BHK</option>
                      <option value="3BHK">3 BHK</option>
                      <option value="4BHK">4 BHK</option>
                      <option value="5BHK">5 BHK</option>
                    </select>

                    {/* Calculated Summary */}
                    {form.startFloor &&
                      form.endFloor &&
                      form.flatsPerFloor &&
                      form.startFloor <= form.endFloor && (
                        <div className="calculation-summary">
                          <p className="summary-text">
                            This will create{" "}
                            <strong>
                              {(form.endFloor - form.startFloor + 1) *
                                form.flatsPerFloor}{" "}
                              flats
                            </strong>{" "}
                            across{" "}
                            <strong>
                              {form.endFloor - form.startFloor + 1}
                            </strong>{" "}
                            floors
                          </p>
                        </div>
                      )}
                  </div>
                </>
              )}
            </>
          )}

          {/* ---------- FLAT ---------- */}
          {type === "FLAT" && (
            <>
              <input
                className="form-control"
                placeholder="Flat No"
                onChange={(e) => setForm({ ...form, flatNo: e.target.value })}
              />
              <input
                className="form-control"
                type="number"
                placeholder="Area (sq ft)"
                onChange={(e) =>
                  setForm({ ...form, areaSqFt: +e.target.value })
                }
              />
              <input
                className="form-control"
                type="number"
                placeholder="Price"
                onChange={(e) => setForm({ ...form, price: +e.target.value })}
              />
              <input
                className="form-control"
                type="number"
                placeholder="BHK"
                onChange={(e) => setForm({ ...form, bhk: +e.target.value })}
              />
              <input
                className="form-control"
                type="number"
                placeholder="Floor"
                onChange={(e) => setForm({ ...form, floor: +e.target.value })}
              />
              <input
                className="form-control"
                type="number"
                placeholder="Washrooms"
                onChange={(e) =>
                  setForm({ ...form, washrooms: +e.target.value })
                }
              />
            </>
          )}

          {/* ---------- ROW HOUSE ---------- */}
          {type === "ROW_HOUSE" && (
            <>
              <input
                className="form-control"
                placeholder="House No"
                onChange={(e) => setForm({ ...form, houseNo: e.target.value })}
              />
              <input
                className="form-control"
                type="number"
                placeholder="Plot Area (sq ft)"
                onChange={(e) =>
                  setForm({ ...form, plotArea: +e.target.value })
                }
              />
              <input
                className="form-control"
                type="number"
                placeholder="Built-up Area (sq ft)"
                onChange={(e) =>
                  setForm({ ...form, builtUpArea: +e.target.value })
                }
              />
              <input
                className="form-control"
                type="number"
                placeholder="Price"
                onChange={(e) => setForm({ ...form, price: +e.target.value })}
              />
              <input
                className="form-control"
                type="number"
                placeholder="BHK"
                onChange={(e) => setForm({ ...form, bhk: +e.target.value })}
              />
              <input
                className="form-control"
                type="number"
                placeholder="Floors"
                onChange={(e) => setForm({ ...form, floors: +e.target.value })}
              />
              <input
                className="form-control"
                type="number"
                placeholder="Parking Count"
                onChange={(e) => setForm({ ...form, parking: +e.target.value })}
              />
            </>
          )}

          {/* ---------- COMMON DIRECTION ---------- */}
          {type !== "WING" && (
            <select
              className="form-control"
              onChange={(e) => setForm({ ...form, direction: e.target.value })}
            >
              <option value="">Facing Direction</option>
              <option value="EAST">East</option>
              <option value="WEST">West</option>
              <option value="NORTH">North</option>
              <option value="SOUTH">South</option>
            </select>
          )}
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary-btn"
            disabled={
              mutation.isPending ||
              !projectId ||
              (type === "WING" && !form.buildingId)
            }
            onClick={submit}
          >
            {mutation.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
