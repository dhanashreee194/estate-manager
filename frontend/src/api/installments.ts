import api from "./axios";

export type InstallmentRow = {
  id: string;
  bookingId: string;
  milestone: string;
  amount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: string;
  paid: boolean;
  daysOverdue: number;
  customerName?: string;
  customerPhone?: string;
  unitNumber?: string;
  projectId?: string;
  projectName?: string;
};

export const getInstallmentsDashboard = () =>
  api.get("/installments/dashboard").then((r) => r.data);

export const getInstallments = (params?: {
  status?: string;
  projectId?: string;
  overdueOnly?: boolean;
}) =>
  api
    .get("/installments", {
      params: {
        status: params?.status,
        projectId: params?.projectId,
        overdueOnly: params?.overdueOnly ? "1" : undefined,
      },
    })
    .then((r) => r.data as InstallmentRow[]);

export const refreshInstallmentStatuses = () =>
  api.post("/installments/refresh-status").then((r) => r.data);

export const downloadDemandLetter = async (installmentId: string) => {
  const lang = localStorage.getItem("estate-manager-lang") || "en";
  const res = await api.get(`/installments/${installmentId}/demand-letter`, {
    responseType: "blob",
    params: { lang },
  });
  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `demand-letter-${installmentId.slice(0, 8)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
