export default function LeadDetailsModal({ lead, onClose }: any) {
  if (!lead) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{lead.name}</h2>

        <p>
          <b>Phone:</b> {lead.phone}
        </p>
        <p>
          <b>Email:</b> {lead.email}
        </p>
        <p>
          <b>Source:</b> {lead.source}
        </p>
        <p>
          <b>Budget:</b> {lead.budget}
        </p>
        <p>
          <b>Requirement:</b> {lead.requirement}
        </p>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
