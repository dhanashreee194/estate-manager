import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createLabour, getLabours } from "../../api/labour";
import { getVendors } from "../../api/vendor";
import "./labour.css";

export default function LabourList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    category: "",
    dailyWage: 0,
    vendorId: "",
  });

  const { data: labours = [], isLoading } = useQuery({
    queryKey: ["labours"],
    queryFn: getLabours,
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors", "LABOUR"],
    queryFn: () => getVendors(),
  });

  const labourVendors = vendors.filter(
    (v: any) => v.type === "LABOUR" || v.type === "BOTH",
  );

  const mutation = useMutation({
    mutationFn: createLabour,
    onSuccess: () => {
      setForm({ name: "", category: "", dailyWage: 0, vendorId: "" });
      queryClient.invalidateQueries({ queryKey: ["labours"] });
    },
  });

  return (
    <div className="page-card">
      <h3>{t("labour.createLabour")}</h3>
      <p className="hint" style={{ opacity: 0.75, marginBottom: "0.75rem" }}>
        {t("labour.vendorHint")}
      </p>

      <div className="form-row">
        <input
          placeholder={t("common.name")}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder={t("labour.categoryHint")}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          type="number"
          placeholder={t("labour.dailyWage")}
          value={form.dailyWage}
          onChange={(e) => setForm({ ...form, dailyWage: +e.target.value })}
        />
        <select
          value={form.vendorId}
          onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
        >
          <option value="">{t("labour.noVendor")}</option>
          {labourVendors.map((v: any) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <button
          className="primary-btn"
          onClick={() =>
            mutation.mutate({
              ...form,
              vendorId: form.vendorId || undefined,
            } as any)
          }
        >
          {t("labour.createLabour")}
        </button>
      </div>

      <div className="table">
        <div className="table-header" style={{ gridTemplateColumns: "1.2fr 1fr 1fr 1.2fr" }}>
          <span>{t("common.name")}</span>
          <span>{t("labour.category")}</span>
          <span>{t("labour.dailyWage")}</span>
          <span>{t("common.vendor")}</span>
        </div>

        {isLoading && (
          <div className="table-row">
            <span>{t("common.loading")}</span>
          </div>
        )}

        {labours.map((labour: any) => (
          <div
            key={labour.id}
            className="table-row"
            style={{ gridTemplateColumns: "1.2fr 1fr 1fr 1.2fr" }}
          >
            <span>{labour.name}</span>
            <span>{labour.category}</span>
            <span>₹{labour.dailyWage}</span>
            <span>{labour.vendor?.name || "—"}</span>
          </div>
        ))}

        {!isLoading && labours.length === 0 && (
          <div className="table-row">
            <span>{t("labour.noLabours")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
