import { useState } from "react";

export default function InventoryForm({
  title,
  submitLabel,
  onSubmit,
  loading,
}: {
  title: string;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: { materialId: string; quantity: number }) => void;
}) {
  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState(0);

  return (
    <div className="form-card">
      <h3>{title}</h3>

      <select
        value={materialId}
        onChange={(e) => setMaterialId(e.target.value)}
      >
        <option value="">Select material</option>
        {/* later: map materials */}
      </select>

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <button
        onClick={() => onSubmit({ materialId, quantity })}
        disabled={loading}
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}
