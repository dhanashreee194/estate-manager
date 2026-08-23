import { useTranslation } from "react-i18next";

export default function BookingStats({ bookings, availableUnits }: any) {
  const { t } = useTranslation();
  const sold = bookings.length;

  const revenue = bookings.reduce(
    (sum: number, b: any) => sum + b.totalPrice,
    0,
  );

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h4>{t("bookings.availableUnits")}</h4>
        <p>{availableUnits.length}</p>
      </div>

      <div className="stat-card">
        <h4>{t("bookings.soldUnits")}</h4>
        <p>{sold}</p>
      </div>

      <div className="stat-card">
        <h4>{t("bookings.totalBookings")}</h4>
        <p>{bookings.length}</p>
      </div>

      <div className="stat-card">
        <h4>{t("bookings.revenue")}</h4>
        <p>₹ {revenue.toLocaleString()}</p>
      </div>
    </div>
  );
}
