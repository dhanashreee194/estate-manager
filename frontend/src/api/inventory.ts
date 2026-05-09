/* =======================
   COMPANY INVENTORY
======================= */

import api from "./axios";

export type Material = {
  id: string;
  name: string;
  unit: string;
  unitCost: number;
};

export async function getMaterials(): Promise<Material[]> {
  const res = await api.get("/inventory/material");
  return res.data;
}
export const createMaterial = async (data: {
  name: string;
  unit: string;
  unitCost: number;
}) => {
  const res = await api.post("/inventory/material", data);
  return res.data;
};

/* =======================
   PROJECT INVENTORY
======================= */

export const getProjectStock = async (projectId: string) => {
  const res = await api.get(`/inventory/project/${projectId}`);
  return res.data;
};

export async function inwardInventory(payload: {
  projectId: string;
  materialId: string;
  quantity: number;
}) {
  const res = await api.post("/inventory/inward", payload);
  return res.data;
}

export const outwardInventory = (data: {
  projectId: string;
  materialId: string;
  quantity: number;
}) => api.post("/inventory/outward", data).then((res) => res.data);

export const getProjectInventory = (projectId: string) =>
  api.get(`/inventory/project/${projectId}`).then((res) => res.data);

export const createMaterialRequirement = (data: {
  projectId: string;
  materialId: string;
  quantity: number;
}) => api.post("/inventory/requirement", data);

export const getProjectInwardHistory = (projectId: string) =>
  api.get(`/inventory/inward/project/${projectId}`).then((res) => res.data);

export const getInwardHistory = (projectId: string, materialId: string) =>
  api.get(`/inventory/inward/${projectId}/${materialId}`).then((r) => r.data);

export const getOutwardHistory = (projectId: string, materialId: string) =>
  api.get(`/inventory/outward/${projectId}/${materialId}`).then((r) => r.data);

export const getProjectOutwardHistory = (projectId: string) =>
  api.get(`/inventory/outward/project/${projectId}`).then((res) => res.data);

// 🔹 Current Stock
export const createRequirement = (payload: {
  projectId: string;
  materialId: string;
  quantity: number;
}) => {
  return api.post("/inventory/requirement", payload).then((res) => res.data);
};

// ✅ GET REQUIREMENTS
export const getProjectRequirements = (projectId: string) => {
  return api.get(`/inventory/requirement/${projectId}`).then((res) => res.data);
};
