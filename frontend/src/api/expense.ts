import api from "./axios";

// Get all expenses of project
export const getProjectExpenses = (projectId: string) =>
  api.get(`/expense/project/${projectId}`).then((r) => r.data);

// Get project cost report

export const getProjectExpenseReport = (projectId: string) =>
  api.get(`/expense/project/${projectId}/report`).then((r) => r.data);
