// your axios instance

import api from "./axios";

export const getKanbanLeads = async () => {
  const res = await api.get("/lead/kanban");
  return res.data;
};

export const updateLeadStatus = async (id: string, status: string) => {
  const res = await api.patch(`/lead/${id}/status`, { status });
  return res.data;
};

export const createLead = async (data: any) => {
  const res = await api.post("/lead", data);
  return res.data;
};

export const updateLead = async (id: string, data: any) => {
  const res = await api.patch(`/lead/${id}`, data);
  return res.data;
};
