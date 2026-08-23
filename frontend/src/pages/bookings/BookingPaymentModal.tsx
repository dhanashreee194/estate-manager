import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { addPayment } from "../../api/payment";
import { getBookingLedger } from "../../api/bookingLedger";
import { getBankAccounts } from "../../api/finance";
import { downloadDemandLetter } from "../../api/installments";
import { downloadBookingAgreement } from "../../api/booking";
import { useAppSelector } from "../../store/hooks";
import "./bookings.css";

export default function BookingPaymentModal({
  bookingId,
  onClose,
}: {
  bookingId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const projectId = useAppSelector((s) => s.project.currentProjectId);
  const { data, isLoading, error } = useQuery({
    queryKey: ["booking-ledger", bookingId],
    queryFn: () => getBookingLedger(bookingId),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: () => getBankAccounts(),
  });

  const [form, setForm] = useState({
    installmentId: "",
    stage: "",
    amount: 0,
    mode: "CASH",
    remarks: "",
    bankAccountId: "",
  });

  const mutation = useMutation({
    mutationFn: addPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["booking-ledger", bookingId] });
      qc.invalidateQueries({ queryKey: ["bookings", projectId] });
      qc.invalidateQueries({ queryKey: ["cashbook"] });
      qc.invalidateQueries({ queryKey: ["finance-summary"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
      qc.invalidateQueries({ queryKey: ["installments"] });
      qc.invalidateQueries({ queryKey: ["installments-dashboard"] });

      alert(t("bookings.paymentAdded"));
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
      alert(t("bookings.selectInstallment"));
      return;
    }
    if (form.amount <= 0) {
      alert(t("bookings.enterValidAmount"));
      return;
    }

    const selected = data?.installments?.find(
      (x: any) => x.id === form.installmentId,
    );
    if (selected) {
      const balance = selected.amount - (selected.paidAmount || 0);
      if (form.amount > balance) {
        alert(t("bookings.amountExceeds"));
        return;
      }
    }

    mutation.mutate({
      bookingId,
      installmentId: form.installmentId,
      stage: form.stage,
      amount: form.amount,
      mode: form.mode,
      remarks: form.remarks || undefined,
      bankAccountId: form.bankAccountId || undefined,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card payment-ledger-modal">
        <div className="ledger-header">
          <h3>{t("bookings.bookingLedger")}</h3>
          <button
            type="button"
            className="ghost-btn"
            onClick={() =>
              downloadBookingAgreement(bookingId).catch(() =>
                alert(t("bookings.agreementFailed")),
              )
            }
          >
            {t("bookings.agreementPdf")}
          </button>
        </div>

        {data && (
          <div className="ledger-summary">
            <span>
              {t("common.total")}: ₹
              {Number(data.totalPrice || 0).toLocaleString("en-IN")}
            </span>
            <span>
              {t("common.paid")}: ₹
              {Number(data.totalPaid || 0).toLocaleString("en-IN")}
            </span>
            <span>
              {t("common.balance")}: ₹
              {Number(data.balance || 0).toLocaleString("en-IN")}
            </span>
            <span className={`inst-badge ${(data.status || "").toLowerCase()}`}>
              {t(`status.${data.status}`, { defaultValue: data.status })}
            </span>
          </div>
        )}

        {isLoading && <p>{t("bookings.loadingLedger")}</p>}
        {error && <p className="ledger-error">{t("bookings.ledgerFailed")}</p>}

        <div className="installments">
          {data?.installments?.map((i: any) => {
            const paid = i.paidAmount || 0;
            const balance = i.amount - paid;
            const selected = form.installmentId === i.id;

            return (
              <div
                key={i.id}
                className={`installment-row ${i.status?.toLowerCase()} ${
                  selected ? "selected" : ""
                }`}
                onClick={() => i.status !== "PAID" && selectInstallment(i)}
              >
                <div>
                  <strong>{i.milestone}</strong>
                  <div className="due-line">
                    {t("common.due")}{" "}
                    {new Date(i.dueDate).toLocaleDateString("en-IN")}
                  </div>
                </div>
                <div>₹{Number(i.amount).toLocaleString("en-IN")}</div>
                <div>
                  {t("common.paid")} ₹{Number(paid).toLocaleString("en-IN")}
                </div>
                <div>
                  {t("common.balance")} ₹
                  {Number(balance).toLocaleString("en-IN")}
                </div>
                <div>
                  <span className={`inst-badge ${i.status?.toLowerCase()}`}>
                    {t(`status.${i.status}`, { defaultValue: i.status })}
                  </span>
                </div>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadDemandLetter(i.id).catch(() =>
                      alert(t("bookings.demandFailed")),
                    );
                  }}
                >
                  {t("bookings.demandPdf")}
                </button>
              </div>
            );
          })}
        </div>

        <h4>{t("bookings.collectPayment")}</h4>

        <input
          readOnly
          type="text"
          value={form.stage}
          placeholder={t("bookings.stage")}
          className="form-control"
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
          <option value="CASH">{t("bookings.cash")}</option>
          <option value="ONLINE">{t("bookings.online")}</option>
          <option value="CHEQUE">{t("bookings.cheque")}</option>
        </select>

        <select
          value={form.bankAccountId}
          onChange={(e) => setForm({ ...form, bankAccountId: e.target.value })}
          className="form-control"
        >
          <option value="">{t("common.cashbookAccount")}</option>
          {accounts.map((a: any) => (
            <option key={a.id} value={a.id}>
              {a.name} — ₹{Number(a.balance).toLocaleString("en-IN")}
            </option>
          ))}
        </select>

        <input
          placeholder={t("common.remarks")}
          className="form-control"
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
        />

        <div className="modal-actions">
          <button onClick={onClose}>{t("common.cancel")}</button>
          <button
            className="primary-btn"
            onClick={submit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
