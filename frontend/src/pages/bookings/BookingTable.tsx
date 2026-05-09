import "./table.css";

export default function BookingTable({ bookings, onEdit, onCancel }: any) {
  if (!bookings.length) {
    return (
      <div className="table-card empty">
        <p>No bookings found for this project.</p>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Unit</th>
              <th>Amount</th>
              <th>Agent</th>
              <th>Status</th>
              <th>Actions</th> {/* ✅ NEW */}
            </tr>
          </thead>

          <tbody>
            {bookings.map((b: any) => (
              <tr key={b.id}>
                <td>{new Date(b.bookingDate).toLocaleDateString("en-IN")}</td>

                <td>
                  <div className="customer-cell">
                    <span className="name">{b.customer?.name}</span>
                    <span className="phone">{b.customer?.phone}</span>
                  </div>
                </td>

                <td>
                  <span className="unit-badge">#{b.unit?.unitNumber}</span>
                </td>

                <td className="amount">
                  ₹ {b.totalPrice?.toLocaleString("en-IN")}
                </td>

                <td>{b.createdBy?.name || "-"}</td>

                <td>
                  <span className={`status-badge ${b.status?.toLowerCase()}`}>
                    {b.status}
                  </span>
                </td>

                {/* ✅ ACTION BUTTONS */}
                <td className="actions">
                  <button className="btn-edit" onClick={() => onEdit(b)}>
                    ✏️ Edit
                  </button>

                  {b.status === "BOOKED" && (
                    <button
                      className="btn-cancel"
                      onClick={() => onCancel(b.id)}
                    >
                      ❌ Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
