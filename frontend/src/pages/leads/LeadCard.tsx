import { useDraggable } from "@dnd-kit/core";
import { leadSourceLabel } from "../../constants/leadSources";
import "./lead.css";

export default function LeadCard({ lead, onClick }: any) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  const sourceClass = `source-badge source-${(lead.source || "OTHER").toLowerCase()}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="lead-card"
      onClick={() => onClick(lead)}
    >
      <div className="drag-handle" {...listeners} {...attributes}>
        ☰
      </div>

      <div className="lead-name">{lead.name}</div>
      <div className="lead-phone">{lead.phone}</div>
      <div className={sourceClass}>{leadSourceLabel(lead.source)}</div>
      {lead.sourceDetail && (
        <div className="lead-source-detail">{lead.sourceDetail}</div>
      )}
    </div>
  );
}
