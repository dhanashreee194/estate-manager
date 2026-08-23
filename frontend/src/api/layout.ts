import api from "./axios";

export type LayoutUnit = {
  id: string;
  unitNumber: string;
  unitType: string;
  status: "AVAILABLE" | "HOLD" | "BOOKED" | "SOLD" | "CANCELLED";
  areaSqFt: number;
  basePrice: number;
  floor?: number | null;
  direction?: string | null;
  layoutRow: number | null;
  layoutCol: number | null;
  wingId?: string | null;
  wingName?: string | null;
  buildingName?: string | null;
  booking?: {
    id: string;
    status: string;
    customerName?: string;
    customerPhone?: string;
  } | null;
};

export type LayoutMapResponse = {
  project: {
    id: string;
    name: string;
    layoutRows: number;
    layoutCols: number;
    layoutImageUrl?: string | null;
  };
  summary: Record<string, number>;
  units: LayoutUnit[];
};

export const getProjectLayout = (projectId: string) =>
  api
    .get(`/unit/project/${projectId}/layout`)
    .then((r) => r.data as LayoutMapResponse);

export const updateLayoutConfig = (
  projectId: string,
  data: { layoutRows?: number; layoutCols?: number; layoutImageUrl?: string | null },
) => api.put(`/unit/project/${projectId}/layout-config`, data).then((r) => r.data);

export const uploadLayoutImage = (projectId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post(`/unit/project/${projectId}/layout-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const clearLayoutImage = (projectId: string) =>
  api.delete(`/unit/project/${projectId}/layout-image`).then((r) => r.data);

export const autoArrangeLayout = (projectId: string) =>
  api
    .post(`/unit/project/${projectId}/layout/auto-arrange`)
    .then((r) => r.data as LayoutMapResponse);

export const placeUnitOnLayout = (
  unitId: string,
  data: { layoutRow: number | null; layoutCol: number | null },
) => api.put(`/unit/${unitId}/place`, data).then((r) => r.data);

export const updateUnitStatus = (
  unitId: string,
  status: LayoutUnit["status"],
) => api.put(`/unit/${unitId}`, { status }).then((r) => r.data);
