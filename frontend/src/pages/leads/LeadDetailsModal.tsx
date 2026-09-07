import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { leadSourceLabel } from "../../constants/leadSources";
import "./lead.css";

export default function LeadDetailsModal({ lead, onClose }: any) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!lead) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lead]);

  if (!lead) return null;

  return createPortal(
    <div
      className="modal-overlay lead-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal lead-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lead-modal-header">
          <h2>{lead.name}</h2>
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
          <p>
            <b>{t("common.phone")}:</b> {lead.phone}
          </p>
          <p>
            <b>{t("common.email")}:</b> {lead.email || "—"}
          </p>
          <p>
            <b>{t("leads.source")}:</b> {leadSourceLabel(lead.source)}
          </p>
          {lead.sourceDetail && (
            <p>
              <b>{t("leads.sourceDetail")}:</b> {lead.sourceDetail}
            </p>
          )}
          {lead.portalListingId && (
            <p>
              <b>{t("leads.portalListingId")}:</b> {lead.portalListingId}
            </p>
          )}
          {lead.portalUrl && (
            <p>
              <b>{t("leads.portalUrl")}:</b>{" "}
              <a href={lead.portalUrl} target="_blank" rel="noreferrer">
                {t("leads.openListing")}
              </a>
            </p>
          )}
          {lead.referredBy && (
            <p>
              <b>{t("leads.referredBy")}:</b> {lead.referredBy}
            </p>
          )}
          <p>
            <b>{t("leads.budget")}:</b> {lead.budget ?? "—"}
          </p>
          <p>
            <b>{t("leads.requirement")}:</b> {lead.requirement || "—"}
          </p>
          {lead.unit && (
            <p>
              <b>{t("marketing.unit")}:</b> {lead.unit.unitType}{" "}
              {lead.unit.unitNumber}
            </p>
          )}
          {lead.campaign && (
            <p>
              <b>{t("marketing.campaign")}:</b> {lead.campaign.title} (
              {lead.campaign.code})
            </p>
          )}
        </div>

        <div className="modal-actions lead-modal-actions">
          <button type="button" className="primary" onClick={onClose}>
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
