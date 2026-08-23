import "./table.css";
import { useTranslation } from "react-i18next";
import { downloadBookingAgreement } from "../../api/booking";

export default function BookingTable({
  bookings,
  onEdit,
  onCancel,
  onPayments,
}: any) {
  const { t } = useTranslation();

  if (!bookings.length) {
    return (
      <div className="table-card empty">
        <p>{t("bookings.empty")}</p>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>{t("common.date")}</th>
              <th>{t("common.customer")}</th>
              <th>{t("common.unit")}</th>
              <th>{t("common.amount")}</th>
              <th>{t("common.broker")}</th>
              <th>{t("common.commission")}</th>
              <th>{t("common.status")}</th>
              <th>{t("common.actions")}</th>
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

                <td>
                  {b.broker?.name || (
                    <span style={{ opacity: 0.5 }}>{t("common.direct")}</span>
                  )}
                </td>

                <td>
                  {b.commission ? (
                    <div className="customer-cell">
                      <span className="name">
                        ₹{" "}
                        {Number(b.commission.commissionAmount).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                      <span className="phone">
                        {b.commission.rate}% ·{" "}
                        {t(`status.${b.commission.status}`, {
                          defaultValue: b.commission.status,
                        })}
                      </span>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>

                <td>
                  <span className={`status-badge ${b.status?.toLowerCase()}`}>
                    {t(`status.${b.status}`, { defaultValue: b.status })}
                  </span>
                </td>

                <td className="actions">
                  <button className="btn-edit" onClick={() => onEdit(b)}>
                    {t("common.edit")}
                  </button>

                  <button
                    className="btn-pdf"
                    onClick={() =>
                      downloadBookingAgreement(b.id).catch(() =>
                        alert(t("bookings.agreementFailed")),
                      )
                    }
                  >
                    {t("bookings.agreementPdf")}
                  </button>

                  {onPayments && b.status === "BOOKED" && (
                    <button
                      className="btn-ledger"
                      onClick={() => onPayments(b.id)}
                    >
                      {t("bookings.ledger")}
                    </button>
                  )}

                  {b.status === "BOOKED" && (
                    <button
                      className="btn-cancel"
                      onClick={() => onCancel(b.id)}
                    >
                      {t("common.cancel")}
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
