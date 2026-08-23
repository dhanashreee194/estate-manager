// your axios instance

import api from "./axios";

export type LeadKanbanFilters = {
  source?: string;
  projectId?: string;
};

export const getKanbanLeads = async (filters?: LeadKanbanFilters) => {
  const res = await api.get("/lead/kanban", { params: filters });
  return res.data;
};

export const getLeadSourceSummary = async (projectId?: string) => {
  const res = await api.get("/lead/sources/summary", {
    params: projectId ? { projectId } : undefined,
  });
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
