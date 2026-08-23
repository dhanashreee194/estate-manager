import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createBroker,
  deactivateBroker,
  getBrokers,
  getCommissions,
  getCommissionSummary,
  markCommissionPaid,
  type Broker,
} from "../../api/broker";
import { getBankAccounts } from "../../api/finance";
import "./brokers.css";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  panNumber: "",
  address: "",
  commissionRate: 2,
};

export default function BrokersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState("");
  const [payAccountId, setPayAccountId] = useState("");

  const { data: brokers = [], isLoading } = useQuery({
    queryKey: ["brokers"],
    queryFn: () => getBrokers(),
  });

  const { data: summary } = useQuery({
    queryKey: ["commission-summary"],
    queryFn: getCommissionSummary,
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ["commissions", statusFilter],
    queryFn: () =>
      getCommissions(statusFilter ? { status: statusFilter } : undefined),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: () => getBankAccounts(),
  });

  const createMut = useMutation({
    mutationFn: createBroker,
    onSuccess: () => {
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["brokers"] });
    },
  });

  const deactivateMut = useMutation({
    mutationFn: deactivateBroker,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["brokers"] }),
  });

  const payMut = useMutation({
    mutationFn: (id: string) =>
      markCommissionPaid(id, {
        bankAccountId: payAccountId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      queryClient.invalidateQueries({ queryKey: ["commission-summary"] });
      queryClient.invalidateQueries({ queryKey: ["brokers"] });
      queryClient.invalidateQueries({ queryKey: ["cashbook"] });
      queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    },
  });

  return (
    <div className="brokers-page">
      <div className="broker-summary">
        <div className="summary-card">
          <h4>{t("brokers.pendingPayout")}</h4>
          <p>₹ {(summary?.pendingAmount || 0).toLocaleString("en-IN")}</p>
        </div>
        <div className="summary-card">
          <h4>{t("common.paid")}</h4>
          <p>₹ {(summary?.paidAmount || 0).toLocaleString("en-IN")}</p>
        </div>
        <div className="summary-card">
          <h4>{t("brokers.pendingDeals")}</h4>
          <p>{summary?.PENDING || 0}</p>
        </div>
        <div className="summary-card">
          <h4>{t("brokers.paidDeals")}</h4>
          <p>{summary?.PAID || 0}</p>
        </div>
      </div>

      <div className="page-card">
        <h3>{t("brokers.title")}</h3>
        <p className="hint">{t("brokers.hint")}</p>

        <div className="form-row wrap">
          <input
            placeholder={t("common.name")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder={t("common.phone")}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            type="number"
            step="0.1"
            placeholder={t("brokers.commissionPercent")}
            value={form.commissionRate}
            onChange={(e) =>
              setForm({ ...form, commissionRate: +e.target.value })
            }
          />
          <input
            placeholder={t("brokers.panOptional")}
            value={form.panNumber}
            onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
          />
          <input
            placeholder={t("common.email")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <button
            className="primary-btn"
            disabled={!form.name || !form.phone || createMut.isPending}
            onClick={() => createMut.mutate(form)}
          >
            {t("brokers.add")}
          </button>
        </div>
      </div>

      <div className="page-card">
        <h3>{t("brokers.list")}</h3>
        <div className="table">
          <div className="table-header broker-grid">
            <span>{t("common.name")}</span>
            <span>{t("common.phone")}</span>
            <span>{t("brokers.ratePercent")}</span>
            <span>{t("brokers.bookings")}</span>
            <span>{t("common.actions")}</span>
          </div>
          {isLoading && (
            <div className="table-row">
              <span>{t("common.loading")}</span>
            </div>
          )}
          {brokers.map((b: Broker) => (
            <div key={b.id} className="table-row broker-grid">
              <span>{b.name}</span>
              <span>{b.phone}</span>
              <span>{b.commissionRate}%</span>
              <span>{b._count?.bookings ?? 0}</span>
              <span>
                <button
                  className="danger"
                  onClick={() => {
                    if (confirm(t("common.deactivateConfirm", { name: b.name })))
                      deactivateMut.mutate(b.id);
                  }}
                >
                  {t("common.deactivate")}
                </button>
              </span>
            </div>
          ))}
          {!isLoading && brokers.length === 0 && (
            <div className="table-row">
              <span>{t("brokers.empty")}</span>
            </div>
          )}
        </div>
      </div>

      <div className="page-card">
        <div className="toolbar">
          <h3>{t("brokers.commissionLedger")}</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              value={payAccountId}
              onChange={(e) => setPayAccountId(e.target.value)}
              title={t("brokers.payFromHint")}
            >
              <option value="">{t("common.payFromAccount")}</option>
              {accounts.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t("common.allStatuses")}</option>
              <option value="PENDING">{t("status.PENDING")}</option>
              <option value="PAID">{t("status.PAID")}</option>
              <option value="CANCELLED">{t("status.CANCELLED")}</option>
            </select>
          </div>
        </div>

        <div className="table">
          <div className="table-header commission-grid">
            <span>{t("common.broker")}</span>
            <span>{t("collections.customerUnit")}</span>
            <span>{t("brokers.deal")}</span>
            <span>{t("brokers.ratePercent")}</span>
            <span>{t("common.commission")}</span>
            <span>{t("common.status")}</span>
            <span>{t("common.actions")}</span>
          </div>
          {commissions.map((c: any) => (
            <div key={c.id} className="table-row commission-grid">
              <span>{c.broker?.name}</span>
              <span>
                {c.booking?.customer?.name || "—"}
                <br />
                <small>
                  #{c.booking?.unit?.unitNumber} · {c.booking?.project?.name}
                </small>
              </span>
              <span>₹ {Number(c.dealAmount).toLocaleString("en-IN")}</span>
              <span>{c.rate}%</span>
              <span>
                ₹ {Number(c.commissionAmount).toLocaleString("en-IN")}
              </span>
              <span className={`comm-status ${c.status?.toLowerCase()}`}>
                {t(`status.${c.status}`, { defaultValue: c.status })}
              </span>
              <span>
                {c.status === "PENDING" && (
                  <button
                    className="primary-btn"
                    disabled={payMut.isPending}
                    onClick={() => {
                      if (confirm(t("brokers.markPaidConfirm")))
                        payMut.mutate(c.id);
                    }}
                  >
                    {t("brokers.markPaid")}
                  </button>
                )}
              </span>
            </div>
          ))}
          {commissions.length === 0 && (
            <div className="table-row">
              <span>{t("brokers.noCommissions")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
