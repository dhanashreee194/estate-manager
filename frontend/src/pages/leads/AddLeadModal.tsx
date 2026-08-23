import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { createLead } from "../../api/lead";
import {
  LEAD_SOURCES,
  QUICK_INTAKE_SOURCES,
  leadSourceLabel,
  type LeadSourceValue,
} from "../../constants/leadSources";
import "./lead.css";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  source: "WALK_IN" as LeadSourceValue,
  sourceDetail: "",
  portalListingId: "",
  portalUrl: "",
  referredBy: "",
  budget: "",
  requirement: "",
  nextFollowUp: "",
};

export default function AddLeadModal({
  open,
  onClose,
  onSuccess,
  defaultProjectId,
  defaultSource,
}: any) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    ...emptyForm,
    source: (defaultSource as LeadSourceValue) || "WALK_IN",
  });

  useEffect(() => {
    if (open) {
      setForm({
        ...emptyForm,
        source: (defaultSource as LeadSourceValue) || "WALK_IN",
      });
    }
  }, [open, defaultSource]);

  if (!open) return null;

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const setSource = (source: LeadSourceValue) => {
    setForm({ ...form, source });
  };

  const needsReferral = form.source === "REFERRAL" || form.source === "BROKER";
  const isPortal = ["PORTAL_99ACRES", "MAGICBRICKS", "HOUSING", "MAKAAN"].includes(
    form.source,
  );

  const submit = async () => {
    try {
      await createLead({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        source: form.source,
        sourceDetail: form.sourceDetail || undefined,
        portalListingId: form.portalListingId || undefined,
        portalUrl: form.portalUrl || undefined,
        referredBy: form.referredBy || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        requirement: form.requirement || undefined,
        nextFollowUp: form.nextFollowUp
          ? new Date(form.nextFollowUp).toISOString()
          : undefined,
        ...(defaultProjectId && { projectId: defaultProjectId }),
      });

      setForm({ ...emptyForm, source: (defaultSource as LeadSourceValue) || "WALK_IN" });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Lead create failed", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-wide">
        <h2>{t("leads.addNew")}</h2>

        <div className="intake-label">{t("leads.quickIntake")}</div>
        <div className="intake-chips">
          {QUICK_INTAKE_SOURCES.map((value) => (
            <button
              key={value}
              type="button"
              className={`intake-chip ${form.source === value ? "active" : ""}`}
              onClick={() => setSource(value)}
            >
              {leadSourceLabel(value)}
            </button>
          ))}
        </div>

        <input name="name" placeholder={t("leads.nameRequired")} value={form.name} onChange={handleChange} />

        <input name="phone" placeholder={t("leads.phoneRequired")} value={form.phone} onChange={handleChange} />

        <input name="email" placeholder={t("common.email")} value={form.email} onChange={handleChange} />

        <label className="field-label">{t("leads.source")}</label>
        <select name="source" value={form.source} onChange={handleChange}>
          {LEAD_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.group} — {s.label}
            </option>
          ))}
        </select>

        {isPortal && (
          <>
            <input
              name="sourceDetail"
              placeholder={t("leads.campaignTitle")}
              value={form.sourceDetail}
              onChange={handleChange}
            />
            <input
              name="portalListingId"
              placeholder={t("leads.portalListingId")}
              value={form.portalListingId}
              onChange={handleChange}
            />
            <input
              name="portalUrl"
              placeholder={t("leads.portalUrl")}
              value={form.portalUrl}
              onChange={handleChange}
            />
          </>
        )}

        {needsReferral && (
          <input
            name="referredBy"
            placeholder={form.source === "BROKER" ? t("leads.brokerName") : t("leads.referredBy")}
            value={form.referredBy}
            onChange={handleChange}
          />
        )}

        {(form.source === "OTHER" || form.source === "WHATSAPP" || form.source === "WEBSITE") && (
          <input
            name="sourceDetail"
            placeholder={t("leads.sourceDetail")}
            value={form.sourceDetail}
            onChange={handleChange}
          />
        )}

        <input
          name="budget"
          placeholder={t("leads.budget")}
          value={form.budget}
          onChange={handleChange}
        />

        <textarea
          name="requirement"
          placeholder={t("leads.requirement")}
          value={form.requirement}
          onChange={handleChange}
        />

        <label className="field-label">{t("leads.nextFollowUp")}</label>
        <input
          type="date"
          name="nextFollowUp"
          value={form.nextFollowUp}
          onChange={handleChange}
        />

        <div className="modal-actions">
          <button onClick={onClose}>{t("common.cancel")}</button>
          <button className="primary" onClick={submit} disabled={!form.name || !form.phone}>
            {t("leads.createLead")}
          </button>
        </div>
      </div>
    </div>
  );
}
