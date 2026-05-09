import api from "./axios";

export type UnitType = "PLOT" | "BUILDING" | "WING" | "FLAT";

// Create unit
export const getProjectUnits = (projectId: string) =>
  api.get(`/unit/project/${projectId}`).then((res) => res.data);

export type CreateUnitPayload = {
  projectId: string;
  unitType: "PLOT" | "FLAT" | "ROW_HOUSE" | "VILLA";
  unitNumber: string;
  areaSqFt: number;
  basePrice: number;

  // relations
  wingId?: string; // ✅ FLAT only
  buildingId?: string; // (if needed later)

  // optional
  direction?: string;
};

export const createUnit = (payload: {
  projectId: string;
  unitType: "PLOT" | "FLAT" | "ROW_HOUSE" | "VILLA";
  unitNumber: string;
  areaSqFt: number;
  basePrice: number;
  direction?: string;
  wingId?: string; // ✅ ADD THIS
}) => api.post("/unit", payload);

// Get available units
export const getAvailableUnits = (projectId: string) =>
  api.get(`/unit/project/${projectId}/available`).then((res) => res.data);

// Get unit
export const getUnit = (id: string) =>
  api.get(`/unit/${id}`).then((res) => res.data);

// Update unit (PATCH kept for compatibility)
export const updateUnit = (id: string, data: any) =>
  api.patch(`/unit/${id}`, data);

// Update unit (PUT) - use this to replace or update core fields
export type UpdateUnitPayload = {
  unitNumber?: string;
  areaSqFt?: number;
  basePrice?: number;
  direction?: string;
  floor?: number;
  status?: string; // e.g. "AVAILABLE" | "BOOKED"
  bhkType?: string;
  wingId?: string;
};

export const updateUnitPut = (id: string, data: UpdateUnitPayload) =>
  api.put(`/unit/${id}`, data);

// Delete unit
export const deleteUnit = (id: string) => api.delete(`/unit/${id}`);

export const createBulkFlats = (payload: {
  projectId: string;
  wingId: string;
  startFloor: number;
  endFloor: number;
  flatsPerFloor: number;
  areaSqFt: number;
  basePrice: number;
  direction?: string;
}) => api.post("/unit/bulk/flats", payload);

export const getUnitsByWing = (wingId: string) =>
  api.get(`/unit/wing/${wingId}`).then((res) => res.data);
