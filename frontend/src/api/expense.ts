import api from "./axios";

export const createExpense = (data: {
  projectId: string;
  type: string;
  amount: number;
  date: string;
  description?: string;
  gstRate?: number;
  gstAmount?: number;
  vendorId?: string;
  vendorGST?: string;
}) => api.post("/expense", data).then((r) => r.data);

export const getProjectExpenses = (projectId: string) =>
  api.get(`/expense/project/${projectId}`).then((r) => r.data);

export const getProjectExpenseReport = (projectId: string) =>
  api.get(`/expense/project/${projectId}/report`).then((r) => r.data);
