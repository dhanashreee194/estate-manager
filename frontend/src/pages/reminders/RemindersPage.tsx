import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  composeReminder,
  createReminder,
  generateReminders,
  getReminderSummary,
  getReminders,
  markReminderDone,
  markReminderSent,
  skipReminder,
  type Reminder,
} from "../../api/reminder";
import "./reminders.css";

const emptyManual = {
  title: "",
  phone: "",
  message: "",
  dueAt: new Date().toISOString().slice(0, 10),
};

export default function RemindersPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [type, setType] = useState("");
  const [dueOnly, setDueOnly] = useState(true);
  const [manual, setManual] = useState(emptyManual);
  const [preview, setPreview] = useState<any>(null);

  const typeFilters = [
    { value: "", label: t("reminders.allTypes") },
    { value: "INSTALLMENT_OVERDUE", label: t("reminders.overdueInstallments") },
    { value: "INSTALLMENT_DUE", label: t("reminders.dueInstallments") },
    { value: "LEAD_FOLLOW_UP", label: t("reminders.leadFollowUps") },
    { value: "MANUAL", label: t("reminders.manual") },
  ];

  const { data: summary } = useQuery({
    queryKey: ["reminder-summary"],
    queryFn: getReminderSummary,
  });

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["reminders", type, dueOnly],
    queryFn: () =>
      getReminders({
        type: type || undefined,
        dueOnly,
        status: "PENDING",
      }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["reminders"] });
    qc.invalidateQueries({ queryKey: ["reminder-summary"] });
  };

  const generateMut = useMutation({
    mutationFn: generateReminders,
    onSuccess: (res) => {
      invalidate();
      alert(res?.message || t("reminders.generated"));
    },
  });

  const createMut = useMutation({
    mutationFn: createReminder,
    onSuccess: () => {
      setManual(emptyManual);
      invalidate();
    },
  });

  const sentMut = useMutation({
    mutationFn: ({ id, channel }: { id: string; channel: string }) =>
      markReminderSent(id, channel),
    onSuccess: invalidate,
  });

  const doneMut = useMutation({
    mutationFn: markReminderDone,
    onSuccess: invalidate,
  });

  const skipMut = useMutation({
    mutationFn: skipReminder,
    onSuccess: invalidate,
  });

  const openChannel = async (id: string, channel: "WHATSAPP" | "SMS") => {
    try {
      const composed = await composeReminder(id);
      setPreview(composed);
      const url = channel === "WHATSAPP" ? composed.waUrl : composed.smsUrl;
      if (!url) {
        alert(t("reminders.noPhone"));
        return;
      }
      window.open(url, "_blank");
      await sentMut.mutateAsync({ id, channel });
    } catch (e) {
      console.error(e);
      alert(t("reminders.openFailed"));
    }
  };

  const typeLabel = (type: string) => {
    const labels: Record<string, string> = {
      INSTALLMENT_OVERDUE: t("reminders.overdueInstallments"),
      INSTALLMENT_DUE: t("reminders.dueInstallments"),
      LEAD_FOLLOW_UP: t("reminders.leadFollowUps"),
      MANUAL: t("reminders.manual"),
    };
    return labels[type] ?? type.replace(/_/g, " ");
  };

  return (
    <div className="reminders-page">
      <div className="reminders-summary">
        <div className="summary-card">
          <h4>{t("reminders.pending")}</h4>
          <p>{summary?.pending || 0}</p>
        </div>
        <div className="summary-card due">
          <h4>{t("reminders.dueToday")}</h4>
          <p>{summary?.dueToday || 0}</p>
        </div>
        <div className="summary-card overdue">
          <h4>{t("reminders.overdueQueue")}</h4>
          <p>{summary?.overdue || 0}</p>
        </div>
        <div className="summary-card">
          <h4>{t("reminders.leadFollowUps")}</h4>
          <p>{summary?.leadsDue || 0}</p>
        </div>
        <div className="summary-card">
          <h4>{t("reminders.installments")}</h4>
          <p>{summary?.installmentsDue || 0}</p>
        </div>
      </div>

      <div className="page-card">
        <div className="toolbar">
          <div>
            <h3>{t("reminders.title")}</h3>
            <p className="hint">{t("reminders.hint")}</p>
          </div>
          <div className="filters">
            <label className="check">
              <input
                type="checkbox"
                checked={dueOnly}
                onChange={(e) => setDueOnly(e.target.checked)}
              />
              {t("reminders.dueOnly")}
            </label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {typeFilters.map((f) => (
                <option key={f.value || "all"} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <button
              className="primary"
              disabled={generateMut.isPending}
              onClick={() => generateMut.mutate()}
            >
              {t("reminders.generate")}
            </button>
          </div>
        </div>

        {isLoading ? (
          <p>{t("common.loading")}</p>
        ) : (
          <div className="table">
            <div className="table-header grid">
              <span>{t("common.due")}</span>
              <span>{t("common.type")}</span>
              <span>{t("common.title")}</span>
              <span>{t("common.phone")}</span>
              <span>{t("common.actions")}</span>
            </div>
            {reminders.map((r: Reminder) => (
              <div key={r.id} className="table-row grid">
                <span>
                  {new Date(r.dueAt).toLocaleDateString("en-IN")}
                  {new Date(r.dueAt) < startOfToday() && (
                    <small className="late">{t("reminders.late")}</small>
                  )}
                </span>
                <span>
                  <span className={`type-badge ${r.type.toLowerCase()}`}>
                    {typeLabel(r.type)}
                  </span>
                </span>
                <span>
                  <strong>{r.title}</strong>
                  {r.message && (
                    <>
                      <br />
                      <small className="msg">{r.message}</small>
                    </>
                  )}
                </span>
                <span>{r.phone || "—"}</span>
                <span className="actions">
                  <button
                    className="wa"
                    onClick={() => openChannel(r.id, "WHATSAPP")}
                  >
                    {t("common.whatsapp")}
                  </button>
                  <button
                    className="sms"
                    onClick={() => openChannel(r.id, "SMS")}
                  >
                    {t("common.sms")}
                  </button>
                  <button
                    className="ghost"
                    onClick={() => doneMut.mutate(r.id)}
                  >
                    {t("common.done")}
                  </button>
                  <button
                    className="ghost"
                    onClick={() => skipMut.mutate(r.id)}
                  >
                    {t("common.skip")}
                  </button>
                </span>
              </div>
            ))}
            {!reminders.length && (
              <div className="table-row">
                <span>{t("reminders.empty")}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="page-card">
        <h3>{t("reminders.addManual")}</h3>
        <div className="manual-form">
          <input
            placeholder={t("reminders.titleRequired")}
            value={manual.title}
            onChange={(e) => setManual({ ...manual, title: e.target.value })}
          />
          <input
            placeholder={t("common.phone")}
            value={manual.phone}
            onChange={(e) => setManual({ ...manual, phone: e.target.value })}
          />
          <input
            type="date"
            value={manual.dueAt}
            onChange={(e) => setManual({ ...manual, dueAt: e.target.value })}
          />
          <input
            placeholder={t("common.message")}
            value={manual.message}
            onChange={(e) => setManual({ ...manual, message: e.target.value })}
          />
          <button
            className="primary"
            disabled={!manual.title || createMut.isPending}
            onClick={() =>
              createMut.mutate({
                type: "MANUAL",
                title: manual.title,
                phone: manual.phone || undefined,
                message: manual.message || undefined,
                dueAt: new Date(manual.dueAt).toISOString(),
                channel: "IN_APP",
                entityType: "Manual",
              })
            }
          >
            {t("reminders.addReminder")}
          </button>
        </div>
      </div>

      {preview && (
        <div className="page-card preview">
          <h3>{t("reminders.lastPreview")}</h3>
          <p>{preview.message}</p>
          <small>
            {preview.waUrl && (
              <a href={preview.waUrl} target="_blank" rel="noreferrer">
                {t("reminders.openWa")}
              </a>
            )}
          </small>
        </div>
      )}
    </div>
  );
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
