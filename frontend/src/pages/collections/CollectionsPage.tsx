import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  downloadDemandLetter,
  getInstallments,
  getInstallmentsDashboard,
  refreshInstallmentStatuses,
  type InstallmentRow,
} from "../../api/installments";
import { getProjects } from "../../api/project";
import BookingPaymentModal from "../bookings/BookingPaymentModal";
import "./collections.css";

function waLink(phone?: string | null, text?: string) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  const normalized =
    digits.length === 10 ? `91${digits}` : digits.replace(/^0+/, "");
  if (!normalized) return null;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${normalized}${q}`;
}

export default function CollectionsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [status, setStatus] = useState("OVERDUE");
  const [projectId, setProjectId] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [collectBookingId, setCollectBookingId] = useState<string | null>(null);

  const statusFilters = [
    { value: "", label: t("collections.allOpenPaid") },
    { value: "OVERDUE", label: t("common.overdue") },
    { value: "DUE", label: t("collections.dueToday") },
    { value: "PARTIAL", label: t("common.partial") },
    { value: "UPCOMING", label: t("common.upcoming") },
    { value: "PAID", label: t("common.paid") },
  ];

  const { data: summary } = useQuery({
    queryKey: ["installments-dashboard"],
    queryFn: getInstallmentsDashboard,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const { data: rows = [], isLoading, isFetching } = useQuery({
    queryKey: ["installments", status, projectId, overdueOnly],
    queryFn: () =>
      getInstallments({
        status: overdueOnly ? undefined : status || undefined,
        projectId: projectId || undefined,
        overdueOnly,
      }),
  });

  const refreshMut = useMutation({
    mutationFn: refreshInstallmentStatuses,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["installments"] });
      qc.invalidateQueries({ queryKey: ["installments-dashboard"] });
    },
  });

  const fmt = (n: number) =>
    `₹ ${(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["installments"] });
    qc.invalidateQueries({ queryKey: ["installments-dashboard"] });
    qc.invalidateQueries({ queryKey: ["booking-ledger"] });
  };

  return (
    <div className="collections-page">
      <div className="collections-summary">
        <div className="summary-card overdue">
          <h4>{t("common.overdue")}</h4>
          <p>{fmt(summary?.overdue || 0)}</p>
          <small>
            {summary?.counts?.overdue || 0} {t("reminders.installments")}
          </small>
        </div>
        <div className="summary-card due">
          <h4>{t("collections.dueToday")}</h4>
          <p>{fmt(summary?.due || 0)}</p>
          <small>
            {summary?.counts?.due || 0} {t("reminders.installments")}
          </small>
        </div>
        <div className="summary-card partial">
          <h4>{t("common.partial")}</h4>
          <p>{fmt(summary?.partial || 0)}</p>
          <small>
            {summary?.counts?.partial || 0} {t("reminders.installments")}
          </small>
        </div>
        <div className="summary-card">
          <h4>{t("common.upcoming")}</h4>
          <p>{fmt(summary?.upcoming || 0)}</p>
          <small>
            {summary?.counts?.upcoming || 0} {t("reminders.installments")}
          </small>
        </div>
        <div className="summary-card collected">
          <h4>{t("common.collected")}</h4>
          <p>{fmt(summary?.collected || 0)}</p>
          <small>
            {summary?.counts?.paid || 0} {t("common.paid")}
          </small>
        </div>
      </div>

      <div className="page-card">
        <div className="toolbar">
          <div>
            <h3>{t("collections.title")}</h3>
            <p className="hint">{t("collections.hint")}</p>
          </div>
          <div className="filters">
            <label className="check">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => {
                  setOverdueOnly(e.target.checked);
                  if (e.target.checked) setStatus("");
                }}
              />
              {t("collections.overdueOnly")}
            </label>
            <select
              value={status}
              disabled={overdueOnly}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusFilters.map((s) => (
                <option key={s.value || "all"} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">{t("common.allProjects")}</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Link className="ghost link-btn" to="/dashboard/reminders">
              {t("collections.remindersQueue")}
            </Link>
            <button
              className="ghost"
              disabled={refreshMut.isPending || isFetching}
              onClick={() => refreshMut.mutate()}
            >
              {t("collections.refreshStatuses")}
            </button>
          </div>
        </div>

        {isLoading ? (
          <p>{t("common.loading")}</p>
        ) : (
          <div className="table">
            <div className="table-header grid">
              <span>{t("common.due")}</span>
              <span>{t("collections.customerUnit")}</span>
              <span>{t("common.project")}</span>
              <span>{t("collections.milestone")}</span>
              <span>{t("common.balance")}</span>
              <span>{t("common.status")}</span>
              <span>{t("common.actions")}</span>
            </div>
            {rows.map((r: InstallmentRow) => {
              const msg = `Dear ${r.customerName || "Customer"}, installment "${r.milestone}" for unit #${r.unitNumber} of ₹${(r.balance || 0).toLocaleString("en-IN")} is ${r.status === "OVERDUE" ? "overdue" : "due"}. Kindly arrange payment.`;
              const wa = waLink(r.customerPhone, msg);
              return (
                <div key={r.id} className="table-row grid">
                  <span>
                    {new Date(r.dueDate).toLocaleDateString("en-IN")}
                    {r.daysOverdue > 0 && (
                      <small className="days">+{r.daysOverdue}d</small>
                    )}
                  </span>
                  <span>
                    <strong>{r.customerName || "—"}</strong>
                    <br />
                    <small>
                      #{r.unitNumber}
                      {r.customerPhone ? ` · ${r.customerPhone}` : ""}
                    </small>
                  </span>
                  <span>{r.projectName || "—"}</span>
                  <span>{r.milestone}</span>
                  <span>
                    <strong>{fmt(r.balance)}</strong>
                    <br />
                    <small>
                      {t("common.of")} {fmt(r.amount)} · {t("common.paid")}{" "}
                      {fmt(r.paidAmount)}
                    </small>
                  </span>
                  <span>
                    <span className={`inst-badge ${r.status.toLowerCase()}`}>
                      {t(`status.${r.status}`, { defaultValue: r.status })}
                    </span>
                  </span>
                  <span className="actions">
                    {r.status !== "PAID" && (
                      <button
                        className="primary"
                        onClick={() => setCollectBookingId(r.bookingId)}
                      >
                        {t("common.collect")}
                      </button>
                    )}
                    {wa && r.status !== "PAID" && (
                      <a
                        className="wa"
                        href={wa}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("common.whatsapp")}
                      </a>
                    )}
                    <button
                      className="ghost"
                      onClick={() =>
                        downloadDemandLetter(r.id).catch(() =>
                          alert(t("collections.demandFailed")),
                        )
                      }
                    >
                      {t("bookings.demandPdf")}
                    </button>
                  </span>
                </div>
              );
            })}
            {!rows.length && (
              <div className="table-row">
                <span>{t("collections.empty")}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {collectBookingId && (
        <BookingPaymentModal
          bookingId={collectBookingId}
          onClose={() => {
            setCollectBookingId(null);
            invalidate();
          }}
        />
      )}
    </div>
  );
}
