import api from "./axios";

export type CreateProjectPayload = {
  name: string;
  location: string;
  status: "ACTIVE" | "INACTIVE";
};

export const createProject = async (payload: CreateProjectPayload) => {
  const res = await api.post("/projects", payload);
  return res.data;
};

export const getProjects = async () => {
  const res = await api.get("/projects");
  return res.data;
};

export const getProject = async (id: string) => {
  const res = await api.get(`/projects/${id}`);
  return res.data;
};
