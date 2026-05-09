import api from "./axios";

// Reports
export const createReport = async (data: any) => {
  const res = await api.post("/daily-report", data);
  console.log("📦 API RAW RESPONSE:", res);
  return res.data;
};

export const getReports = (projectId: string) =>
  api.get(`/daily-report/project/${projectId}`).then((r) => r.data);

export const addLabour = (reportId: string, data: any) =>
  api.post(`/daily-report/${reportId}/labour`, data);

export const addMaterial = (reportId: string, data: any) =>
  api.post(`/daily-report/${reportId}/material`, data);

// Payment
export const addDailyPayment = (data: any) =>
  api.post("/daily-report/payment", data);

// Goods
export const addGoods = (data: any) => api.post("/daily-report/goods", data);

export const updateReport = (id: string, data: any) =>
  api.put(`/daily-report/${id}`, data).then((r) => r.data);

export const getReportById = (id: string) =>
  api.get(`/daily-report/${id}`).then((r) => r.data);
