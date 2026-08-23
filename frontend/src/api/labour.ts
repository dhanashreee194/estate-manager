import api from "./axios";

// 1. Create labour
export const createLabour = (data: {
  name: string;
  category: string;
  dailyWage: number;
  vendorId?: string;
}) => api.post("/labour", data).then((r) => r.data);

// 3. Mark attendance
export const markAttendance = (data: {
  labourId: string;
  projectId: string;
  date: string;
  present: boolean;
  wageForDay: number;
}) => api.post("/labour/attendance", data);

// 4. Get project attendance
export const getProjectAttendance = (projectId: string) =>
  api.get(`/labour/attendance/${projectId}`).then((res) => res.data);

export const getLabours = () => api.get("/labour").then((res) => res.data);

export const assignLabour = (payload: {
  labourId: string;
  projectId: string;
}) => api.post("/labour/assign", payload).then((res) => res.data);

export const getAssignedLabours = (projectId: string) =>
  api.get(`/labour/assigned/${projectId}`).then((res) => res.data);

export const removeAssignedLabour = (id: string) =>
  api.delete(`/labour/assign/${id}`);

export const getLabour = (id: string) =>
  api.get(`/labour/${id}`).then((res) => res.data);

export const updateAttendance = (id: string, data: any) =>
  api.patch(`/labour/attendance/${id}`, data);

export const deleteAttendance = (id: string) =>
  api.delete(`/labour/attendance/${id}`);
