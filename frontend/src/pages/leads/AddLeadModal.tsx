import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { createLead } from "../../api/lead";
import {
  LEAD_SOURCES,
  QUICK_INTAKE_SOURCES,
  leadSourceLabel,
  type LeadSourceValue,
} from "../../constants/leadSources";
import {
  LEAD_REQUIREMENTS,
  isPresetRequirement,
} from "../../constants/leadRequirements";
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
  requirementOther: "",
  nextFollowUp: "",
};

function parseBudget(value: string): number | undefined {
  if (!value?.trim()) return undefined;
  const numeric = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

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
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
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
  const isPortal = [
    "PORTAL_99ACRES",
    "MAGICBRICKS",
    "HOUSING",
    "MAKAAN",
  ].includes(form.source);

  const resolvedRequirement =
    form.requirement === "Other"
      ? form.requirementOther.trim() || "Other"
      : form.requirement || undefined;

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
        budget: parseBudget(form.budget),
        requirement: resolvedRequirement,
        nextFollowUp: form.nextFollowUp
          ? new Date(form.nextFollowUp).toISOString()
          : undefined,
        ...(defaultProjectId && { projectId: defaultProjectId }),
      });

      setForm({
        ...emptyForm,
        source: (defaultSource as LeadSourceValue) || "WALK_IN",
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Lead create failed", err);
    }
  };

  return createPortal(
    <div
      className="modal-overlay lead-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-lead-title"
      onClick={onClose}
    >
      <div
        className="modal modal-wide lead-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lead-modal-header">
          <h2 id="add-lead-title">{t("leads.addNew")}</h2>
          <button
            type="button"
            className="lead-modal-close"
            onClick={onClose}
            aria-label={t("common.close")}
          >
            ×
          </button>
        </div>

        <div className="lead-modal-body">
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

          <input
            name="name"
            placeholder={t("leads.nameRequired")}
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="phone"
            placeholder={t("leads.phoneRequired")}
            value={form.phone}
            onChange={handleChange}
          />

          <input
            name="email"
            placeholder={t("common.email")}
            value={form.email}
            onChange={handleChange}
          />

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
              placeholder={
                form.source === "BROKER"
                  ? t("leads.brokerName")
                  : t("leads.referredBy")
              }
              value={form.referredBy}
              onChange={handleChange}
            />
          )}

          {(form.source === "OTHER" ||
            form.source === "WHATSAPP" ||
            form.source === "WEBSITE") && (
            <input
              name="sourceDetail"
              placeholder={t("leads.sourceDetail")}
              value={form.sourceDetail}
              onChange={handleChange}
            />
          )}

          <input
            name="budget"
            inputMode="decimal"
            placeholder={t("leads.budgetPlaceholder")}
            value={form.budget}
            onChange={handleChange}
          />

          <label className="field-label" htmlFor="lead-requirement">
            {t("leads.requirement")}
          </label>
          <select
            id="lead-requirement"
            name="requirement"
            value={
              isPresetRequirement(form.requirement)
                ? form.requirement
                : form.requirement
                  ? "Other"
                  : ""
            }
            onChange={handleChange}
          >
            <option value="">{t("leads.requirementPlaceholder")}</option>
            {LEAD_REQUIREMENTS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          {(form.requirement === "Other" ||
            (form.requirement && !isPresetRequirement(form.requirement))) && (
            <input
              name="requirementOther"
              placeholder={t("leads.requirementOther")}
              value={
                form.requirement === "Other"
                  ? form.requirementOther
                  : form.requirement
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  requirement: "Other",
                  requirementOther: e.target.value,
                })
              }
            />
          )}

          <label className="field-label">{t("leads.nextFollowUp")}</label>
          <input
            type="date"
            name="nextFollowUp"
            value={form.nextFollowUp}
            onChange={handleChange}
          />
        </div>

        <div className="modal-actions lead-modal-actions">
          <button type="button" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className="primary"
            onClick={submit}
            disabled={!form.name || !form.phone}
          >
            {t("leads.createLead")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
