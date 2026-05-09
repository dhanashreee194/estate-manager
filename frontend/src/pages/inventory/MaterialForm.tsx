import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMaterial } from "../../api/inventory";
import "./inventory.css";

export default function MaterialForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [unitCost, setUnitCost] = useState(0);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      onClose();
    },
  });

  const submit = () => {
    if (!name || !unit || !unitCost) {
      alert("Please fill all fields");
      return;
    }

    mutation.mutate({ name, unit, unitCost });
  };

  return (
    <div className="modal">
      <div className="modal-card">
        <h3>Add Material</h3>

        <input
          placeholder="Material Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="form-control"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          <option value="">Select Unit</option>
          <option value="BAG">Bag</option>
          <option value="KG">Kg</option>
          <option value="TON">Ton</option>
          <option value="PIECE">Piece</option>
          <option value="LITER">Liter</option>
          <option value="BRASS">Brass</option>
        </select>

        <input
          type="number"
          placeholder="Unit Cost"
          value={unitCost}
          onChange={(e) => setUnitCost(Number(e.target.value))}
        />

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button className="primary-btn" onClick={submit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
