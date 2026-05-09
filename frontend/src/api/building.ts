import api from "./axios";

export const createBuilding = (payload: {
  projectId: string;
  name: string;
  facing?: string;
}) => api.post("/building", payload);

export const getBuildingsByProject = (projectId: string) =>
  api.get(`/building/project/${projectId}`).then((res) => res.data);

export const getProjectBuildings = (projectId: string) =>
  api.get(`/building/project/${projectId}`).then((res) => res.data);

export const updateBuilding = (
  id: string,
  data: { name?: string; facing?: string },
) => api.put(`/building/${id}`, data);

export const deleteBuilding = (id: string) => api.delete(`/building/${id}`);
