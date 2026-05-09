import "./inventory.css";

export default function MaterialTable({ materials }: { materials: any[] }) {
  return (
    <div className="material-card">
      <div className="material-table-header">
        <span>Name</span>
        <span>Unit</span>
        <span>Unit Cost</span>
      </div>

      {materials.length ? (
        materials.map((m) => (
          <div className="material-row" key={m.id}>
            <span className="material-name">{m.name}</span>
            <span>{m.unit}</span>
            <span>₹{m.unitCost}</span>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <p>No materials added yet</p>
          <span>Add materials to start managing inventory</span>
        </div>
      )}
    </div>
  );
}
