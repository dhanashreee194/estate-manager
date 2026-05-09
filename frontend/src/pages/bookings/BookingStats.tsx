export default function BookingStats({ bookings, availableUnits }: any) {
  const sold = bookings.length;

  const revenue = bookings.reduce(
    (sum: number, b: any) => sum + b.totalPrice,
    0,
  );

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h4>Available Units</h4>
        <p>{availableUnits.length}</p>
      </div>

      <div className="stat-card">
        <h4>Sold Units</h4>
        <p>{sold}</p>
      </div>

      <div className="stat-card">
        <h4>Total Bookings</h4>
        <p>{bookings.length}</p>
      </div>

      <div className="stat-card">
        <h4>Revenue</h4>
        <p>₹ {revenue.toLocaleString()}</p>
      </div>
    </div>
  );
}
