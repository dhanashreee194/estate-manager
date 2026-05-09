import api from "./axios";

export const getBookingLedger = (bookingId: string) =>
  api.get(`/payment/booking/${bookingId}/ledger`).then((r) => r.data);
