import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { updateUnitPut } from "../../../api/unit";
import { updateBuilding } from "../../../api/building";
import { updateWing } from "../../../api/wing";
import "./units.css";

type UnitType = "PLOT" | "BUILDING" | "WING" | "FLAT";

interface Props {
  type: UnitType;
  unit: any;
  projectId: string;
  onClose: () => void;
}

export default function UnitEditModal({
  type,
  unit,
  projectId,
  onClose,
}: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(unit || {});

  /* -------- UNIT (Plot / Flat) -------- */
  const updateUnitMutation = useMutation({
    mutationFn: (data: any) => updateUnitPut(unit.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["units", projectId] });
      onClose();
    },
    onError: (err) => {
      console.error("Update unit failed", err);
      alert("Failed to update unit");
    },
  });

  /* -------- BUILDING -------- */
  const updateBuildingMutation = useMutation({
    mutationFn: (data: any) => updateBuilding(unit.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["buildings", projectId] });
      onClose();
    },
    onError: (err) => {
      console.error("Update building failed", err);
      alert("Failed to update building");
    },
  });

  /* -------- WING -------- */
  const updateWingMutation = useMutation({
    mutationFn: (data: any) => updateWing(unit.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["units", projectId] });
      onClose();
    },
    onError: (err) => {
      console.error("Update wing failed", err);
      alert("Failed to update wing");
    },
  });

  const submit = () => {
    if (type === "PLOT") {
      updateUnitMutation.mutate({
        unitNumber: form.unitNumber,
        areaSqFt: form.areaSqFt,
        basePrice: form.basePrice,
        direction: form.direction,
      });
      return;
    }
    if (type === "BUILDING") {
      updateBuildingMutation.mutate({
        name: form.name,
        facing: form.direction,
      });
      return;
    }
    if (type === "WING") {
      updateWingMutation.mutate({
        name: form.name,
        totalFloors: form.totalFloors,
        flatsPerFloor: form.flatsPerFloor,
        hasLift: form.hasLift,
      });
      return;
    }
    if (type === "FLAT") {
      updateUnitMutation.mutate({
        unitNumber: form.unitNumber,
        areaSqFt: form.areaSqFt,
        basePrice: form.basePrice,
        direction: form.direction,
      });
      return;
    }
  };

  const isLoading =
    updateUnitMutation.isPending ||
    updateBuildingMutation.isPending ||
    updateWingMutation.isPending;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h4>Edit {type.charAt(0) + type.slice(1).toLowerCase()}</h4>
        <div className="modal-content">
          {/* ---------- PLOT ---------- */}
          {type === "PLOT" && (
            <>
              <input
                className="form-control"
                placeholder="Plot No"
                value={form.unitNumber || ""}
                onChange={(e) =>
                  setForm({ ...form, unitNumber: e.target.value })
                }
              />
              <input
                className="form-control"
                type="number"
                placeholder="Area (sq ft)"
                value={form.areaSqFt || ""}
                onChange={(e) =>
                  setForm({ ...form, areaSqFt: +e.target.value })
                }
              />
              <input
                className="form-control"
                type="number"
                placeholder="Base Price"
                value={form.basePrice || ""}
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
                <option value="">Facing Direction</option>
                <option value="EAST">East</option>
                <option value="WEST">West</option>
                <option value="NORTH">North</option>
                <option value="SOUTH">South</option>
              </select>
            </>
          )}

          {/* ---------- BUILDING ---------- */}
          {type === "BUILDING" && (
            <>
              <input
                className="form-control"
                placeholder="Building Name"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <select
                className="form-control"
                value={form.direction || ""}
                onChange={(e) =>
                  setForm({ ...form, direction: e.target.value })
                }
              >
                <option value="">Facing Direction</option>
                <option value="EAST">East</option>
                <option value="WEST">West</option>
                <option value="NORTH">North</option>
                <option value="SOUTH">South</option>
              </select>
            </>
          )}

          {/* ---------- WING ---------- */}
          {type === "WING" && (
            <>
              <input
                className="form-control"
                placeholder="Wing Name"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="form-control"
                type="number"
                placeholder="Total Floors"
                value={form.totalFloors || ""}
                onChange={(e) =>
                  setForm({ ...form, totalFloors: +e.target.value })
                }
              />
              <input
                className="form-control"
                type="number"
                placeholder="Flats Per Floor"
                value={form.flatsPerFloor || ""}
                onChange={(e) =>
                  setForm({ ...form, flatsPerFloor: +e.target.value })
                }
              />
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
              </div>
            </>
          )}

          {/* ---------- FLAT ---------- */}
          {type === "FLAT" && (
            <>
              <input
                className="form-control"
                placeholder="Flat No"
                value={form.unitNumber || ""}
                onChange={(e) =>
                  setForm({ ...form, unitNumber: e.target.value })
                }
              />
              <input
                className="form-control"
                type="number"
                placeholder="Area (sq ft)"
                value={form.areaSqFt || ""}
                onChange={(e) =>
                  setForm({ ...form, areaSqFt: +e.target.value })
                }
              />
              <input
                className="form-control"
                type="number"
                placeholder="Price"
                value={form.basePrice || ""}
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
                <option value="">Facing Direction</option>
                <option value="EAST">East</option>
                <option value="WEST">West</option>
                <option value="NORTH">North</option>
                <option value="SOUTH">South</option>
              </select>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-btn" disabled={isLoading} onClick={submit}>
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
