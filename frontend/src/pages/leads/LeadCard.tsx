import { useDraggable } from "@dnd-kit/core";
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="lead-card"
      onClick={() => onClick(lead)}
    >
      {/* drag handle */}
      <div className="drag-handle" {...listeners} {...attributes}>
        ☰
      </div>

      <div className="lead-name">{lead.name}</div>
      <div className="lead-phone">{lead.phone}</div>
      <div className="lead-source">{lead.source || "No Source"}</div>
    </div>
  );
}
