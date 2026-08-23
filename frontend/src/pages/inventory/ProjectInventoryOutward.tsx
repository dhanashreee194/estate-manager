import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  outwardInventory,
  getProjectOutwardHistory,
  getProjectInventory,
} from "../../api/inventory";
import { useState } from "react";
import MaterialSelect from "./MaterialSelect";

export default function ProjectInventoryOutward() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const queryClient = useQueryClient();

  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState(0);

  const { data: stock = [] } = useQuery({
    queryKey: ["project-inventory", projectId],
    queryFn: () => getProjectInventory(projectId!),
    enabled: !!projectId,
  });

  const { data = [], isLoading } = useQuery({
    queryKey: ["inventory-outward", projectId],
    queryFn: () => getProjectOutwardHistory(projectId!),
    enabled: !!projectId,
  });
  console.log(data);
  const availableQty =
    stock.find((i: any) => i.materialId === materialId)?.quantity ?? 0;

  const mutation = useMutation({
    mutationFn: outwardInventory,
    onSuccess: () => {
      setMaterialId("");
      setQuantity(0);

      queryClient.invalidateQueries({
        queryKey: ["inventory-outward", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-inventory", projectId],
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!materialId || quantity <= 0) return;
    if (quantity > availableQty) {
      alert(t("inventory.onlyAvailable", { qty: availableQty }));
      return;
    }

    mutation.mutate({
      projectId: projectId!,
      materialId,
      quantity,
    });
  };

  return (
    <div className="material-card">
      <form onSubmit={handleSubmit} className="inventory-form">
        <h3 className="section-title">{t("inventory.outwardMaterial")}</h3>

        <div className="form-row">
          <MaterialSelect value={materialId} onChange={setMaterialId} />

          <input
            type="number"
            min={1}
            placeholder={`${t("inventory.availableQty")}: ${availableQty}`}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <button
            type="submit"
            className="primary-btn"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t("common.saving") : t("inventory.removeStock")}
          </button>
        </div>
      </form>

      <div className="material-table">
        <div className="material-table-header">
          <span>{t("common.name")}</span>
          <span>{t("inventory.outward")}</span>
          <span>{t("inventory.availableQty")}</span>
          <span>{t("common.date")}</span>
        </div>

        {isLoading ? (
          <p className="empty-state">{t("common.loading")}</p>
        ) : data.length === 0 ? (
          <p className="empty-state">{t("inventory.noOutward")}</p>
        ) : (
          data.map((row: any) => {
            const availableQty =
              stock.find((i: any) => i.materialId === row.materialId)
                ?.quantity ?? 0;

            return (
              <div key={row.id} className="material-row">
                <span className="material-name">{row.material.name}</span>

                <span className="negative">-{row.quantity}</span>

                <span className="neutral">{availableQty}</span>

                <span>{new Date(row.createdAt).toLocaleDateString()}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
