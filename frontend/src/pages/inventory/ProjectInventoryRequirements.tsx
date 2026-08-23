import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import MaterialSelect from "./MaterialSelect";
import {
  createRequirement,
  fulfillRequirement,
  getProjectRequirements,
} from "../../api/inventory";
import { getVendors } from "../../api/vendor";

export default function ProjectInventoryRequirements() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [fulfillId, setFulfillId] = useState<string | null>(null);
  const [fulfillQty, setFulfillQty] = useState(0);
  const [fulfillVendorId, setFulfillVendorId] = useState("");
  const [fulfillCost, setFulfillCost] = useState(0);

  const { data = [], isLoading } = useQuery({
    queryKey: ["inventory-requirements", projectId],
    queryFn: () => getProjectRequirements(projectId!),
    enabled: !!projectId,
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => getVendors(),
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

  const fulfillMut = useMutation({
    mutationFn: () =>
      fulfillRequirement(fulfillId!, {
        quantity: fulfillQty,
        vendorId: fulfillVendorId || undefined,
        unitCost: fulfillCost || undefined,
      }),
    onSuccess: () => {
      setFulfillId(null);
      setFulfillQty(0);
      setFulfillVendorId("");
      setFulfillCost(0);
      queryClient.invalidateQueries({
        queryKey: ["inventory-requirements", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-inventory", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory-inward", projectId],
      });
    },
  });

  if (!projectId) {
    return <p className="empty-state">{t("inventory.invalidProject")}</p>;
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
      <form onSubmit={handleSubmit} className="inventory-form">
        <h3 className="section-title">{t("inventory.materialRequirement")}</h3>

        <div className="form-row">
          <MaterialSelect value={materialId} onChange={setMaterialId} />

          <input
            type="number"
            min={1}
            placeholder={t("inventory.requiredQty")}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <button className="primary-btn" disabled={mutation.isPending}>
            {t("inventory.raiseRequirement")}
          </button>
        </div>
      </form>

      <div className="material-table">
        <div className="material-table-header grid-5">
          <span>{t("inventory.materialName")}</span>
          <span>{t("common.required")}</span>
          <span>{t("inventory.fulfilled")}</span>
          <span>{t("common.pending")}</span>
          <span>{t("common.actions")}</span>
        </div>

        {isLoading ? (
          <p className="empty-state">{t("inventory.loadingRequirements")}</p>
        ) : data.length === 0 ? (
          <p className="empty-state">{t("inventory.noRequirements")}</p>
        ) : (
          data.map((row: any) => {
            const pending =
              row.pendingQty ?? Math.max(0, row.requiredQty - row.fulfilledQty);
            return (
              <div key={row.id} className="material-row grid-5">
                <span className="material-name">{row.material.name}</span>
                <span>{row.requiredQty}</span>
                <span className="positive">{row.fulfilledQty}</span>
                <span className="negative">{pending}</span>
                <span>
                  {pending > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFulfillId(row.id);
                        setFulfillQty(pending);
                      }}
                    >
                      {t("inventory.fulfill")}
                    </button>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>

      {fulfillId && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{t("inventory.fulfillRequirement")}</h3>
              <button className="close-btn" onClick={() => setFulfillId(null)}>
                ✕
              </button>
            </div>
            <div className="form-group">
              <label>{t("inventory.quantity")}</label>
              <input
                type="number"
                value={fulfillQty}
                onChange={(e) => setFulfillQty(+e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>{t("common.vendor")}</label>
              <select
                value={fulfillVendorId}
                onChange={(e) => setFulfillVendorId(e.target.value)}
              >
                <option value="">{t("common.optional")}</option>
                {vendors
                  .filter((v: any) => v.type !== "LABOUR")
                  .map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t("inventory.unitCost")}</label>
              <input
                type="number"
                value={fulfillCost}
                onChange={(e) => setFulfillCost(+e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setFulfillId(null)}>{t("common.cancel")}</button>
              <button
                className="primary-btn"
                disabled={!fulfillQty || fulfillMut.isPending}
                onClick={() => fulfillMut.mutate()}
              >
                {t("inventory.confirmFulfill")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
