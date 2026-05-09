import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inwardInventory, getProjectInwardHistory } from "../../api/inventory";
import { useState } from "react";
import MaterialSelect from "./MaterialSelect";

export default function ProjectInventoryInward() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();

  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState(0);

  const { data = [], isLoading } = useQuery({
    queryKey: ["inventory-inward", projectId],
    queryFn: () => getProjectInwardHistory(projectId!),
    enabled: !!projectId,
  });

  const mutation = useMutation({
    mutationFn: inwardInventory,
    onSuccess: () => {
      setMaterialId("");
      setQuantity(0);

      queryClient.invalidateQueries({
        queryKey: ["inventory-inward", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-inventory", projectId],
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialId || quantity <= 0) return;

    mutation.mutate({
      projectId: projectId!,
      materialId,
      quantity,
    });
  };

  return (
    <div className="material-card">
      {/* Inward Form */}
      <form onSubmit={handleSubmit} className="inventory-form">
        <h3 className="section-title">Inward Material</h3>

        <div className="form-row">
          <MaterialSelect value={materialId} onChange={setMaterialId} />

          <input
            type="number"
            min={1}
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <button
            type="submit"
            className="primary-btn"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Add Inward"}
          </button>
        </div>
      </form>

      {/* Inward History */}
      <div className="material-table">
        <div className="material-table-header">
          <span>Material</span>
          <span>Quantity</span>
          <span>Date</span>
        </div>

        {isLoading ? (
          <p className="empty-state">Loading inward history…</p>
        ) : data.length === 0 ? (
          <p className="empty-state">No inward records yet</p>
        ) : (
          data.map((item: any) => (
            <div key={item.id} className="material-row">
              <span className="material-name">{item.material.name}</span>
              <span className="positive">
                +{item.quantity} {item.material.unit}
              </span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
