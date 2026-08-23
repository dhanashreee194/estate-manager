import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createVendor,
  deactivateVendor,
  getVendors,
  recordVendorPayment,
  type Vendor,
} from "../../api/vendor";
import { getProjects } from "../../api/project";
import "./vendors.css";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  gstNumber: "",
  address: "",
  type: "BOTH" as Vendor["type"],
};

export default function VendorsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<string>("");
  const [payVendor, setPayVendor] = useState<Vendor | null>(null);
  const [payForm, setPayForm] = useState({
    projectId: "",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    description: "",
    gstRate: 0,
  });

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["vendors", filter],
    queryFn: () => getVendors(filter || undefined),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const createMut = useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });

  const deactivateMut = useMutation({
    mutationFn: deactivateVendor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendors"] }),
  });

  const payMut = useMutation({
    mutationFn: () =>
      recordVendorPayment(payVendor!.id, {
        ...payForm,
        amount: Number(payForm.amount),
        gstRate: Number(payForm.gstRate) || undefined,
      }),
    onSuccess: () => {
      setPayVendor(null);
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });

  return (
    <div className="vendors-page">
      <div className="page-card">
        <h3>{t("vendors.title")}</h3>
        <p className="hint">{t("vendors.hint")}</p>

        <div className="form-row wrap">
          <input
            placeholder={t("vendors.vendorName")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder={t("common.phone")}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            placeholder={t("vendors.gstNumber")}
            value={form.gstNumber}
            onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
          />
          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as Vendor["type"] })
            }
          >
            <option value="BOTH">{t("vendors.labourMaterial")}</option>
            <option value="LABOUR">{t("vendors.labourContractor")}</option>
            <option value="MATERIAL">{t("vendors.materialSupplier")}</option>
          </select>
          <input
            placeholder={t("common.address")}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <button
            className="primary-btn"
            disabled={!form.name || createMut.isPending}
            onClick={() => createMut.mutate(form)}
          >
            {t("vendors.add")}
          </button>
        </div>
      </div>

      <div className="page-card">
        <div className="toolbar">
          <h3>{t("vendors.title")}</h3>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">{t("vendors.allTypes")}</option>
            <option value="LABOUR">{t("vendors.labour")}</option>
            <option value="MATERIAL">{t("vendors.material")}</option>
            <option value="BOTH">{t("vendors.both")}</option>
          </select>
        </div>

        <div className="table">
          <div className="table-header vendor-grid">
            <span>{t("common.name")}</span>
            <span>{t("common.type")}</span>
            <span>{t("common.phone")}</span>
            <span>{t("common.gst")}</span>
            <span>{t("vendors.labours")}</span>
            <span>{t("vendors.inwards")}</span>
            <span>{t("common.actions")}</span>
          </div>

          {isLoading && (
            <div className="table-row">
              <span>{t("common.loading")}</span>
            </div>
          )}

          {vendors.map((v) => (
            <div key={v.id} className="table-row vendor-grid">
              <span>{v.name}</span>
              <span>{v.type}</span>
              <span>{v.phone || "—"}</span>
              <span>{v.gstNumber || "—"}</span>
              <span>{v._count?.labours ?? 0}</span>
              <span>{v._count?.inventoryInwards ?? 0}</span>
              <span className="actions">
                <button onClick={() => setPayVendor(v)}>{t("common.pay")}</button>
                <button
                  className="danger"
                  onClick={() => {
                    if (confirm(t("common.deactivateConfirm", { name: v.name })))
                      deactivateMut.mutate(v.id);
                  }}
                >
                  {t("common.deactivate")}
                </button>
              </span>
            </div>
          ))}

          {!isLoading && vendors.length === 0 && (
            <div className="table-row">
              <span>{t("vendors.empty")}</span>
            </div>
          )}
        </div>
      </div>

      {payVendor && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{t("common.pay")} {payVendor.name}</h3>
              <button className="close-btn" onClick={() => setPayVendor(null)}>
                ✕
              </button>
            </div>
            <div className="form-group">
              <label>{t("common.project")}</label>
              <select
                value={payForm.projectId}
                onChange={(e) =>
                  setPayForm({ ...payForm, projectId: e.target.value })
                }
              >
                <option value="">{t("common.selectProject")}</option>
                {projects.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t("common.amount")}</label>
              <input
                type="number"
                value={payForm.amount}
                onChange={(e) =>
                  setPayForm({ ...payForm, amount: +e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>{t("common.gstPercent")}</label>
              <input
                type="number"
                value={payForm.gstRate}
                onChange={(e) =>
                  setPayForm({ ...payForm, gstRate: +e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>{t("common.date")}</label>
              <input
                type="date"
                value={payForm.date}
                onChange={(e) =>
                  setPayForm({ ...payForm, date: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>{t("common.description")}</label>
              <input
                value={payForm.description}
                onChange={(e) =>
                  setPayForm({ ...payForm, description: e.target.value })
                }
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setPayVendor(null)}>{t("common.cancel")}</button>
              <button
                className="primary-btn"
                disabled={!payForm.projectId || !payForm.amount || payMut.isPending}
                onClick={() => payMut.mutate()}
              >
                {t("vendors.recordPayment")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
