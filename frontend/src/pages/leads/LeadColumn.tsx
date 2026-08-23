import { useDroppable } from "@dnd-kit/core";
import { useTranslation } from "react-i18next";
import LeadCard from "./LeadCard";

export default function LeadColumn({ status, leads, onLeadClick }: any) {
  const { t } = useTranslation();
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div ref={setNodeRef} className="lead-column">
      <div className="column-header">
        {t(`status.${status}`, { defaultValue: status })} ({leads.length})
      </div>

      <div className="column-body">
        {leads.map((lead: any) => (
          <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
        ))}
      </div>
    </div>
  );
}
