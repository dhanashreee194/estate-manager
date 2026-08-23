import api from "./axios";

export const createReport = async (data: any) => {
  const res = await api.post("/daily-report", data);
  return res.data;
};

export const getReports = (projectId: string) =>
  api.get(`/daily-report/project/${projectId}`).then((r) => r.data);

export const addLabour = (reportId: string, data: any) =>
  api.post(`/daily-report/${reportId}/labour`, data).then((r) => r.data);

export const addMaterial = (reportId: string, data: any) =>
  api.post(`/daily-report/${reportId}/material`, data).then((r) => r.data);

export const addDailyPayment = (reportId: string, data: any) =>
  api.post(`/daily-report/${reportId}/payment`, data).then((r) => r.data);

export const addGoods = (reportId: string, data: any) =>
  api.post(`/daily-report/${reportId}/goods`, data).then((r) => r.data);

export const saveDailySheet = (reportId: string, data: any) =>
  api.post(`/daily-report/${reportId}/sheet`, data).then((r) => r.data);

export const updateReport = (id: string, data: any) =>
  api.put(`/daily-report/${id}`, data).then((r) => r.data);

export const getReportById = (id: string) =>
  api.get(`/daily-report/${id}`).then((r) => r.data);
