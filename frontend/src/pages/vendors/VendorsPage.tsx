import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createVendor,
  deactivateVendor,
  getVendorPayments,
  getVendors,
  recordVendorPayment,
  type Vendor,
} from "../../api/vendor";
import { getProjects } from "../../api/project";
import { getBankAccounts } from "../../api/finance";
import { PAYMENT_MODES } from "../../api/expense";
import "./vendors.css";
import ModalPortal from "../../components/ModalPortal";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  gstNumber: "",
  address: "",
  type: "BOTH" as Vendor["type"],
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VendorsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<string>("");
  const [payVendor, setPayVendor] = useState<Vendor | null>(null);
  const [viewVendor, setViewVendor] = useState<Vendor | null>(null);
  const [payForm, setPayForm] = useState({
    projectId: "",
    amount: 0,
    date: new Date().toISOString().slice(0, 16),
    description: "",
    gstRate: 0,
    paymentMode: "CASH",
    bankAccountId: "",
  });

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["vendors", filter],
    queryFn: () => getVendors(filter || undefined),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: getBankAccounts,
  });

  const { data: paymentHistory, isLoading: paymentsLoading } = useQuery({
    queryKey: ["vendor-payments", viewVendor?.id],
    queryFn: () => getVendorPayments(viewVendor!.id),
    enabled: !!viewVendor?.id,
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
        date: new Date(payForm.date).toISOString(),
        gstRate: Number(payForm.gstRate) || undefined,
        paymentMode: payForm.paymentMode || undefined,
        bankAccountId: payForm.bankAccountId || undefined,
      }),
    onSuccess: () => {
      const vendorId = payVendor?.id;
      setPayVendor(null);
      setPayForm({
        projectId: "",
        amount: 0,
        date: new Date().toISOString().slice(0, 16),
        description: "",
        gstRate: 0,
        paymentMode: "CASH",
        bankAccountId: "",
      });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      if (vendorId) {
        queryClient.invalidateQueries({
          queryKey: ["vendor-payments", vendorId],
        });
      }
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
                <button type="button" onClick={() => setViewVendor(v)}>
                  {t("vendors.view")}
                </button>
                <button type="button" onClick={() => setPayVendor(v)}>
                  {t("common.pay")}
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    if (
                      confirm(t("common.deactivateConfirm", { name: v.name }))
                    )
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

      {viewVendor && (
        <ModalPortal>
          <div className="modal-backdrop" onClick={() => setViewVendor(null)}>
            <div
              className="modal-card vendor-payments-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>
                  {t("vendors.paymentHistory")} — {viewVendor.name}
                </h3>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setViewVendor(null)}
                >
                  ✕
                </button>
              </div>

              {paymentsLoading && <p>{t("common.loading")}</p>}

              {!paymentsLoading &&
                (!paymentHistory?.payments ||
                  paymentHistory.payments.length === 0) && (
                  <p className="hint">{t("vendors.noPayments")}</p>
                )}

              {!paymentsLoading &&
                paymentHistory?.payments &&
                paymentHistory.payments.length > 0 && (
                  <>
                    <div className="payment-history-table">
                      <div className="table-header payment-grid">
                        <span>{t("expenses.paidAt")}</span>
                        <span>{t("vendors.billOrReason")}</span>
                        <span>{t("common.project")}</span>
                        <span>{t("expenses.paymentMode")}</span>
                        <span>{t("common.amount")}</span>
                      </div>
                      {paymentHistory.payments.map((p) => (
                        <div key={p.id} className="table-row payment-grid">
                          <span>{formatDate(p.date)}</span>
                          <span>
                            {p.billOrReason || p.description || "—"}
                          </span>
                          <span>{p.projectName || "—"}</span>
                          <span>{p.paymentMode || "—"}</span>
                          <span>{formatMoney(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="payment-total">
                      <strong>{t("vendors.totalPaid")}:</strong>{" "}
                      {formatMoney(paymentHistory.totalAmount)}
                    </div>
                  </>
                )}

              <div className="modal-actions">
                <button type="button" onClick={() => setViewVendor(null)}>
                  {t("common.close")}
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => {
                    setPayVendor(viewVendor);
                    setViewVendor(null);
                  }}
                >
                  {t("common.pay")}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {payVendor && (
        <ModalPortal>
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
                <h3>
                  {t("common.pay")} {payVendor.name}
                </h3>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setPayVendor(null)}
                >
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
                  type="datetime-local"
                  value={payForm.date}
                  onChange={(e) =>
                    setPayForm({ ...payForm, date: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>{t("expenses.paymentMode")}</label>
                <select
                  value={payForm.paymentMode}
                  onChange={(e) =>
                    setPayForm({ ...payForm, paymentMode: e.target.value })
                  }
                >
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {t(`expenses.modes.${mode}`, { defaultValue: mode })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t("common.payFromAccount")}</label>
                <select
                  value={payForm.bankAccountId}
                  onChange={(e) =>
                    setPayForm({ ...payForm, bankAccountId: e.target.value })
                  }
                >
                  <option value="">{t("common.optional")}</option>
                  {accounts.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t("vendors.billOrReason")}</label>
                <input
                  value={payForm.description}
                  placeholder={t("vendors.billOrReasonPlaceholder")}
                  onChange={(e) =>
                    setPayForm({ ...payForm, description: e.target.value })
                  }
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setPayVendor(null)}>
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  disabled={
                    !payForm.projectId || !payForm.amount || payMut.isPending
                  }
                  onClick={() => payMut.mutate()}
                >
                  {t("vendors.recordPayment")}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
