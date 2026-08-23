import { api } from "../auth/auth.api";

export const getBookingPayments = (bookingId: string) =>
  api.get(`/payment/booking/${bookingId}`);

export const addPayment = (data: {
  bookingId: string;
  amount: number;
  stage: string;
  mode: string;
  installmentId?: string;
  remarks?: string;
  bankAccountId?: string;
}) => api.post("/payment", data).then((r) => r.data);
