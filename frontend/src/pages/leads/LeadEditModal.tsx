import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { updateLead } from "../../api/lead";
import { LEAD_SOURCES } from "../../constants/leadSources";
import "./lead.css";

export default function LeadEditModal({ lead, onClose, onSaved }: any) {
  const { t } = useTranslation();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (lead) {
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
        requirement: lead.requirement || "",
        nextFollowUp: lead.nextFollowUp
          ? new Date(lead.nextFollowUp).toISOString().slice(0, 10)
          : "",
      });
    }
  }, [lead]);

  if (!lead) return null;

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const isPortal = ["PORTAL_99ACRES", "MAGICBRICKS", "HOUSING", "MAKAAN"].includes(
    form.source,
  );
  const needsReferral = form.source === "REFERRAL" || form.source === "BROKER";

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
        budget: form.budget === "" || form.budget == null ? undefined : Number(form.budget),
        requirement: form.requirement || undefined,
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

  return (
    <div className="modal-overlay">
      <div className="modal modal-wide">
        <h2>{t("leads.editLead")}</h2>

        <input name="name" value={form.name || ""} onChange={handleChange} />

        <input name="phone" value={form.phone || ""} onChange={handleChange} />

        <input name="email" value={form.email || ""} onChange={handleChange} />

        <label className="field-label">{t("leads.source")}</label>
        <select name="source" value={form.source || "OTHER"} onChange={handleChange}>
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
            placeholder={form.source === "BROKER" ? t("leads.brokerName") : t("leads.referredBy")}
            value={form.referredBy || ""}
            onChange={handleChange}
          />
        )}

        <input
          name="budget"
          value={form.budget ?? ""}
          onChange={handleChange}
          placeholder={t("leads.budget")}
        />

        <textarea
          name="requirement"
          value={form.requirement || ""}
          onChange={handleChange}
          placeholder={t("leads.requirement")}
        />

        <label className="field-label">{t("leads.nextFollowUp")}</label>
        <input
          type="date"
          name="nextFollowUp"
          value={form.nextFollowUp || ""}
          onChange={handleChange}
        />

        <div className="modal-actions">
          <button onClick={onClose}>{t("common.close")}</button>

          <button className="primary" onClick={save}>
            {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
