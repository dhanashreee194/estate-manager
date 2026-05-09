import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import "./units.css";
import { createBulkFlats } from "../../../api/unit";
import { useAppSelector } from "../../../store/hooks";

interface Props {
  wingId: string;
  onClose: () => void;
}

export default function BulkFlatCreateModal({ wingId, onClose }: Props) {
  const projectId = useAppSelector((state) => state.project.currentProjectId);
  const qc = useQueryClient();

  const [form, setForm] = useState({
    startFloor: 1,
    endFloor: 1,
    flatsPerFloor: 1,
    areaSqFt: 0,
    basePrice: 0,
    direction: "",
  });

  const mutation = useMutation({
    mutationFn: createBulkFlats,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["units", projectId] });
      onClose();
    },
    onError: (err) => {
      console.error("Bulk flat creation failed", err);
      alert("Failed to create flats");
    },
  });

  const submit = () => {
    if (!projectId) {
      alert("Project ID not found. Please select a project.");
      return;
    }

    if (form.endFloor < form.startFloor) {
      alert("End floor cannot be less than start floor");
      return;
    }

    mutation.mutate({
      projectId,
      wingId,
      startFloor: form.startFloor,
      endFloor: form.endFloor,
      flatsPerFloor: form.flatsPerFloor,
      areaSqFt: form.areaSqFt,
      basePrice: form.basePrice,
      direction: form.direction || undefined,
    });
  };

  const totalFlats = (form.endFloor - form.startFloor + 1) * form.flatsPerFloor;

  return (
    <div className="modal-backdrop">
      <div className="modal-card large">
        <h4>Bulk Create Flats</h4>

        <div className="grid-2">
          <input
            className="form-control"
            type="number"
            placeholder="Start Floor"
            value={form.startFloor}
            onChange={(e) => setForm({ ...form, startFloor: +e.target.value })}
          />

          <input
            className="form-control"
            type="number"
            placeholder="End Floor"
            value={form.endFloor}
            onChange={(e) => setForm({ ...form, endFloor: +e.target.value })}
          />

          <input
            className="form-control"
            type="number"
            placeholder="Flats per Floor"
            value={form.flatsPerFloor}
            onChange={(e) =>
              setForm({ ...form, flatsPerFloor: +e.target.value })
            }
          />

          <input
            className="form-control"
            type="number"
            placeholder="Area per Flat (sq ft)"
            value={form.areaSqFt}
            onChange={(e) => setForm({ ...form, areaSqFt: +e.target.value })}
          />

          <input
            className="form-control"
            type="number"
            placeholder="Base Price per Flat"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: +e.target.value })}
          />

          <select
            className="form-control"
            value={form.direction}
            onChange={(e) => setForm({ ...form, direction: e.target.value })}
          >
            <option value="">Facing Direction</option>
            <option value="EAST">East</option>
            <option value="WEST">West</option>
            <option value="NORTH">North</option>
            <option value="SOUTH">South</option>
          </select>
        </div>

        <div className="bulk-summary">
          <strong>Total Flats:</strong> {totalFlats}
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary-btn"
            onClick={submit}
            disabled={mutation.isPending || !projectId}
          >
            {mutation.isPending ? "Creating..." : "Create Flats"}
          </button>
        </div>
      </div>
    </div>
  );
}
