import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { updateLead } from "../../api/lead";
import { LEAD_SOURCES } from "../../constants/leadSources";
import {
  LEAD_REQUIREMENTS,
  isPresetRequirement,
} from "../../constants/leadRequirements";
import "./lead.css";

function parseBudget(value: string | number): number | undefined {
  if (value === "" || value == null) return undefined;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  const numeric = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

export default function LeadEditModal({ lead, onClose, onSaved }: any) {
  const { t } = useTranslation();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (lead) {
      const requirement = lead.requirement || "";
      setForm({
        name: lead.name || "",
        phone: lead.phone || "",
        email: lead.email || "",
        source: lead.source || "OTHER",
        sourceDetail: lead.sourceDetail || "",
        portalListingId: lead.portalListingId || "",
        portalUrl: lead.portalUrl || "",
        referredBy: lead.referredBy || "",
        budget: lead.budget ?? "",
        requirement: isPresetRequirement(requirement)
          ? requirement
          : requirement
            ? "Other"
            : "",
        requirementOther: isPresetRequirement(requirement) ? "" : requirement,
        nextFollowUp: lead.nextFollowUp
          ? new Date(lead.nextFollowUp).toISOString().slice(0, 10)
          : "",
      });
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [lead]);

  if (!lead) return null;

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const isPortal = [
    "PORTAL_99ACRES",
    "MAGICBRICKS",
    "HOUSING",
    "MAKAAN",
  ].includes(form.source);
  const needsReferral = form.source === "REFERRAL" || form.source === "BROKER";

  const resolvedRequirement =
    form.requirement === "Other"
      ? (form.requirementOther || "").trim() || "Other"
      : form.requirement || undefined;

  const save = async () => {
    try {
      await updateLead(lead.id, {
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
          : null,
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return createPortal(
    <div
      className="modal-overlay lead-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal modal-wide lead-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lead-modal-header">
          <h2>{t("leads.editLead")}</h2>
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
          <input name="name" value={form.name || ""} onChange={handleChange} />

          <input
            name="phone"
            value={form.phone || ""}
            onChange={handleChange}
          />

          <input
            name="email"
            value={form.email || ""}
            onChange={handleChange}
          />

          <label className="field-label">{t("leads.source")}</label>
          <select
            name="source"
            value={form.source || "OTHER"}
            onChange={handleChange}
          >
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
                value={form.sourceDetail || ""}
                onChange={handleChange}
              />
              <input
                name="portalListingId"
                placeholder={t("leads.portalListingId")}
                value={form.portalListingId || ""}
                onChange={handleChange}
              />
              <input
                name="portalUrl"
                placeholder={t("leads.portalUrl")}
                value={form.portalUrl || ""}
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
              value={form.referredBy || ""}
              onChange={handleChange}
            />
          )}

          <input
            name="budget"
            inputMode="decimal"
            value={form.budget ?? ""}
            onChange={handleChange}
            placeholder={t("leads.budgetPlaceholder")}
          />

          <label className="field-label" htmlFor="edit-lead-requirement">
            {t("leads.requirement")}
          </label>
          <select
            id="edit-lead-requirement"
            name="requirement"
            value={form.requirement || ""}
            onChange={handleChange}
          >
            <option value="">{t("leads.requirementPlaceholder")}</option>
            {LEAD_REQUIREMENTS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          {form.requirement === "Other" && (
            <input
              name="requirementOther"
              placeholder={t("leads.requirementOther")}
              value={form.requirementOther || ""}
              onChange={handleChange}
            />
          )}

          <label className="field-label">{t("leads.nextFollowUp")}</label>
          <input
            type="date"
            name="nextFollowUp"
            value={form.nextFollowUp || ""}
            onChange={handleChange}
          />
        </div>

        <div className="modal-actions lead-modal-actions">
          <button type="button" onClick={onClose}>
            {t("common.close")}
          </button>
          <button type="button" className="primary" onClick={save}>
            {t("common.save")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
