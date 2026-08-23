import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { inwardInventory, getProjectInwardHistory } from "../../api/inventory";
import { getVendors } from "../../api/vendor";
import { useState } from "react";
import MaterialSelect from "./MaterialSelect";

export default function ProjectInventoryInward() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const queryClient = useQueryClient();

  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [vendorId, setVendorId] = useState("");
  const [unitCost, setUnitCost] = useState(0);
  const [invoiceNo, setInvoiceNo] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["inventory-inward", projectId],
    queryFn: () => getProjectInwardHistory(projectId!),
    enabled: !!projectId,
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => getVendors(),
  });

  const materialVendors = vendors.filter(
    (v: any) => v.type === "MATERIAL" || v.type === "BOTH",
  );

  const mutation = useMutation({
    mutationFn: inwardInventory,
    onSuccess: () => {
      setMaterialId("");
      setQuantity(0);
      setVendorId("");
      setUnitCost(0);
      setInvoiceNo("");
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
      vendorId: vendorId || undefined,
      unitCost: unitCost || undefined,
      invoiceNo: invoiceNo || undefined,
    });
  };

  return (
    <div className="material-card">
      <form onSubmit={handleSubmit} className="inventory-form">
        <h3 className="section-title">{t("inventory.inwardMaterial")}</h3>

        <div className="form-row">
          <MaterialSelect value={materialId} onChange={setMaterialId} />

          <input
            type="number"
            min={1}
            placeholder={t("inventory.quantity")}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
          >
            <option value="">{t("inventory.supplierOptional")}</option>
            {materialVendors.map((v: any) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={0}
            placeholder={t("inventory.unitCost")}
            value={unitCost}
            onChange={(e) => setUnitCost(Number(e.target.value))}
          />

          <input
            placeholder={t("inventory.invoiceNo")}
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
          />

          <button
            type="submit"
            className="primary-btn"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t("common.saving") : t("inventory.addInward")}
          </button>
        </div>
      </form>

      <div className="material-table">
        <div
          className="material-table-header"
          style={{ gridTemplateColumns: "1.2fr 0.8fr 1fr 0.8fr 0.9fr" }}
        >
          <span>{t("inventory.materialName")}</span>
          <span>{t("inventory.quantity")}</span>
          <span>{t("common.vendor")}</span>
          <span>{t("inventory.invoice")}</span>
          <span>{t("common.date")}</span>
        </div>

        {isLoading ? (
          <p className="empty-state">{t("common.loading")}</p>
        ) : data.length === 0 ? (
          <p className="empty-state">{t("inventory.noInward")}</p>
        ) : (
          data.map((item: any) => (
            <div
              key={item.id}
              className="material-row"
              style={{ gridTemplateColumns: "1.2fr 0.8fr 1fr 0.8fr 0.9fr" }}
            >
              <span className="material-name">{item.material.name}</span>
              <span className="positive">
                +{item.quantity} {item.material.unit}
              </span>
              <span>{item.vendor?.name || "—"}</span>
              <span>{item.invoiceNo || "—"}</span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
