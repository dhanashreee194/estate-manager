import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import MaterialSelect from "./MaterialSelect";
import { createRequirement, getProjectRequirements } from "../../api/inventory";

export default function ProjectInventoryRequirements() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState(0);

  const { data = [], isLoading } = useQuery({
    queryKey: ["inventory-requirements", projectId],
    queryFn: () => getProjectRequirements(projectId!),
    enabled: !!projectId,
  });

  const mutation = useMutation({
    mutationFn: createRequirement,
    onSuccess: () => {
      setMaterialId("");
      setQuantity(0);
      queryClient.invalidateQueries({
        queryKey: ["inventory-requirements", projectId],
      });
    },
  });

  if (!projectId) {
    return <p className="empty-state">Invalid project</p>;
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialId || quantity <= 0) return;

    mutation.mutate({
      projectId,
      materialId,
      quantity,
    });
  };

  return (
    <div className="material-card">
      {/* Requirement Form */}
      <form onSubmit={handleSubmit} className="inventory-form">
        <h3 className="section-title">Material Requirement</h3>

        <div className="form-row">
          <MaterialSelect value={materialId} onChange={setMaterialId} />

          <input
            type="number"
            min={1}
            placeholder="Required quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <button className="primary-btn" disabled={mutation.isPending}>
            Raise Requirement
          </button>
        </div>
      </form>

      {/* Requirement Table */}
      <div className="material-table">
        <div className="material-table-header grid-5">
          <span>Material</span>
          <span>Required</span>
          <span>Fulfilled</span>
          <span>Pending</span>
          <span>Date</span>
        </div>

        {isLoading ? (
          <p className="empty-state">Loading requirements…</p>
        ) : data.length === 0 ? (
          <p className="empty-state">No requirements raised yet</p>
        ) : (
          data.map((row: any) => (
            <div key={row.id} className="material-row grid-5">
              <span className="material-name">{row.material.name}</span>

              <span>{row.requiredQty}</span>

              <span className="positive">{row.fulfilledQty}</span>

              <span className="negative">{row.pendingQty}</span>

              <span>{new Date(row.createdAt).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
