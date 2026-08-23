import { useTranslation } from "react-i18next";
import { leadSourceLabel } from "../../constants/leadSources";

export default function LeadDetailsModal({ lead, onClose }: any) {
  const { t } = useTranslation();

  if (!lead) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{lead.name}</h2>

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

        <button onClick={onClose}>{t("common.close")}</button>
      </div>
    </div>
  );
}
