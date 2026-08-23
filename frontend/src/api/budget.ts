import api from "./axios";

export const getBudget = (projectId: string) =>
  api.get(`/budget/project/${projectId}`).then((r) => r.data);

export const setBudget = (projectId: string, amount: number) =>
  api.post(`/budget/project/${projectId}`, { amount }).then((r) => r.data);
