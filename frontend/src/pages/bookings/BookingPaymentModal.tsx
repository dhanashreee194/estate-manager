import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addPayment } from "../../api/payment";
import { getBookingLedger } from "../../api/bookingLedger";
import { useAppSelector } from "../../store/hooks";
export default function BookingPaymentModal({
  bookingId,
  onClose,
}: {
  bookingId: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const projectId = useAppSelector((s) => s.project.currentProjectId);
  const { data } = useQuery({
    queryKey: ["booking-ledger", bookingId],
    queryFn: () => getBookingLedger(bookingId),
  });

  const [form, setForm] = useState({
    installmentId: "",
    stage: "",
    amount: 0,
    mode: "CASH",
    remarks: "",
  });

  const mutation = useMutation({
    mutationFn: addPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["booking-ledger", bookingId] });
      qc.invalidateQueries({ queryKey: ["bookings", projectId] });

      alert("Payment added");
      onClose();
    },
  });

  const selectInstallment = (i: any) => {
    const balance = i.amount - (i.paidAmount || 0);

    setForm((prev) => ({
      ...prev,
      installmentId: i.id,
      stage: i.milestone,
      amount: balance,
    }));
  };

  const submit = () => {
    if (!form.installmentId) {
      alert("Select installment");
      return;
    }

    if (form.amount <= 0) {
      alert("Enter valid amount");
      return;
    }

    const selected = data?.installments?.find(
      (x: any) => x.id === form.installmentId,
    );

    if (selected) {
      const balance = selected.amount - (selected.paidAmount || 0);

      if (form.amount > balance) {
        alert("Amount exceeds balance");
        return;
      }
    }

    mutation.mutate({
      bookingId,
      ...form,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>💳 Booking Payments</h3>

        {/* INSTALLMENTS */}
        <div className="installments">
          {data?.installments?.map((i: any) => {
            const paid = i.paidAmount || 0;
            const balance = i.amount - paid;

            return (
              <div
                key={i.id}
                className={`installment-row ${i.status?.toLowerCase()}`}
                onClick={() => i.status !== "PAID" && selectInstallment(i)}
              >
                <div>
                  <strong>{i.milestone}</strong>
                </div>

                <div>Total: ₹{Number(i.amount).toLocaleString()}</div>
                <div>Paid: ₹{Number(paid).toLocaleString()}</div>
                <div>Balance: ₹{Number(balance).toLocaleString()}</div>

                <div>
                  <span className="badge">{i.status}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `/api/installments/${i.id}/demand-letter`,
                      "_blank",
                    );
                  }}
                >
                  PDF
                </button>
              </div>
            );
          })}
        </div>

        <h4>Add Payment</h4>

        <input
          readOnly
          type="text"
          value={form.stage}
          placeholder="Stage"
          className="form-control"
          onChange={(e) => setForm({ ...form, stage: e.target.value })}
        />

        <input
          type="number"
          value={form.amount}
          min={0}
          step="0.01"
          className="form-control"
          onChange={(e) => setForm({ ...form, amount: +e.target.value })}
        />

        <select
          value={form.mode}
          onChange={(e) => setForm({ ...form, mode: e.target.value })}
          className="form-control"
        >
          <option>CASH</option>
          <option>ONLINE</option>
          <option>CHEQUE</option>
        </select>

        <input
          placeholder="Remarks"
          className="form-control"
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
        />

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>

          <button
            className="primary-btn"
            onClick={submit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
