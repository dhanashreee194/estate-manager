import api from "./axios";

export const createWing = (payload: {
  buildingId: string;
  name: string;
  totalFloors: number;
  flatsPerFloor: number;
  hasLift: boolean;
  autoCreateFlats?: boolean;
  flatConfig?: {
    startFloor: number;
    endFloor: number;
    areaSqFt: number;
    basePrice: number;
    direction?: string;
    bhkType?: string;
  };
}) => api.post("/wing", payload);

export const getWings = (buildingId: string) =>
  api.get(`/wing/building/${buildingId}`).then((res) => res.data);

export const getWing = (id: string) =>
  api.get(`/wing/${id}`).then((res) => res.data);
export type UpdateWingPayload = {
  name?: string;
  totalFloors?: number;
  flatsPerFloor?: number;
  hasLift?: boolean;
  liftsCount?: number;
};

// Update wing (PUT) — preferred for full updates
export const updateWing = (id: string, data: UpdateWingPayload) =>
  api.put(`/wing/${id}`, data);

export const deleteWing = (id: string) => api.delete(`/wing/${id}`);

export const getWingsByBuilding = (buildingId: string) =>
  api.get(`/wing/building/${buildingId}`).then((res) => res.data);

export const getWingsByProject = (projectId: string) =>
  api.get(`/wing/project/${projectId}`).then((res) => res.data);

export const getWingsByBuildingId = (buildingId: string) =>
  api.get(`/wing/building/${buildingId}`).then((res) => res.data);
export const getFlatsByWing = (wingId: string) =>
  api.get(`/flat/wing/${wingId}`).then((res) => res.data);
export const createFlat = (payload: {
  wingId: string;
  unitNumber: string;
  areaSqFt: number;
  basePrice: number;
  floorNumber: number;
  direction?: string;
}) => api.post("/flat", payload);
export const deleteFlat = (id: string) => api.delete(`/flat/${id}`);
export const updateFlat = (id: string, data: any) =>
  api.patch(`/flat/${id}`, data);
export const getFlat = (id: string) =>
  api.get(`/flat/${id}`).then((res) => res.data);
export const getFlatsByProject = (projectId: string) =>
  api.get(`/flat/project/${projectId}`).then((res) => res.data);
export const getFlatsByBuilding = (buildingId: string) =>
  api.get(`/flat/building/${buildingId}`).then((res) => res.data);
export const getFlatsByWingId = (wingId: string) =>
  api.get(`/flat/wing/${wingId}`).then((res) => res.data);
export const getAvailableFlats = (projectId: string) =>
  api.get(`/flat/project/${projectId}/available`).then((res) => res.data);
export const getAvailableFlatsByBuilding = (buildingId: string) =>
  api.get(`/flat/building/${buildingId}/available`).then((res) => res.data);
export const getAvailableFlatsByWing = (wingId: string) =>
  api.get(`/flat/wing/${wingId}/available`).then((res) => res.data);
export const getFlatsByFloor = (wingId: string, floorNumber: number) =>
  api.get(`/flat/wing/${wingId}/floor/${floorNumber}`).then((res) => res.data);
export const getAvailableFlatsByFloor = (wingId: string, floorNumber: number) =>
  api
    .get(`/flat/wing/${wingId}/floor/${floorNumber}/available`)
    .then((res) => res.data);
export const getFlatsCountByWing = (wingId: string) =>
  api.get(`/flat/wing/${wingId}/count`).then((res) => res.data);
export const getAvailableFlatsCountByWing = (wingId: string) =>
  api.get(`/flat/wing/${wingId}/available/count`).then((res) => res.data);
export const getFlatsCountByBuilding = (buildingId: string) =>
  api.get(`/flat/building/${buildingId}/count`).then((res) => res.data);
export const getAvailableFlatsCountByBuilding = (buildingId: string) =>
  api
    .get(`/flat/building/${buildingId}/available/count`)
    .then((res) => res.data);
export const getFlatsCountByProject = (projectId: string) =>
  api.get(`/flat/project/${projectId}/count`).then((res) => res.data);
export const getAvailableFlatsCountByProject = (projectId: string) =>
  api.get(`/flat/project/${projectId}/available/count`).then((res) => res.data);
export const getWingsCountByBuilding = (buildingId: string) =>
  api.get(`/wing/building/${buildingId}/count`).then((res) => res.data);
export const getWingsCountByProject = (projectId: string) =>
  api.get(`/wing/project/${projectId}/count`).then((res) => res.data);
export const getUnitsCountByProject = (projectId: string) =>
  api.get(`/unit/project/${projectId}/count`).then((res) => res.data);
export const getAvailableUnitsCountByProject = (projectId: string) =>
  api.get(`/unit/project/${projectId}/available/count`).then((res) => res.data);
export const getUnitsCountByBuilding = (buildingId: string) =>
  api.get(`/unit/building/${buildingId}/count`).then((res) => res.data);
export const getAvailableUnitsCountByBuilding = (buildingId: string) =>
  api
    .get(`/unit/building/${buildingId}/available/count`)
    .then((res) => res.data);
export const getUnitsCountByWing = (wingId: string) =>
  api.get(`/unit/wing/${wingId}/count`).then((res) => res.data);
export const getAvailableUnitsCountByWing = (wingId: string) =>
  api.get(`/unit/wing/${wingId}/available/count`).then((res) => res.data);
export const getUnitsByBuilding = (buildingId: string) =>
  api.get(`/unit/building/${buildingId}`).then((res) => res.data);
export const getUnitsByWing = (wingId: string) =>
  api.get(`/unit/wing/${wingId}`).then((res) => res.data);
export const getUnitsByFlat = (flatId: string) =>
  api.get(`/unit/flat/${flatId}`).then((res) => res.data);
export const getAvailableUnitsByBuilding = (buildingId: string) =>
  api.get(`/unit/building/${buildingId}/available`).then((res) => res.data);
export const getAvailableUnitsByWing = (wingId: string) =>
  api.get(`/unit/wing/${wingId}/available`).then((res) => res.data);
export const getAvailableUnitsByFlat = (flatId: string) =>
  api.get(`/unit/flat/${flatId}/available`).then((res) => res.data);
export const deleteUnitById = (unitId: string) => api.delete(`/unit/${unitId}`);
export const updateUnitById = (unitId: string, data: any) =>
  api.patch(`/unit/${unitId}`, data);
export const getUnitById = (unitId: string) =>
  api.get(`/unit/${unitId}`).then((res) => res.data);
export const createUnitByPayload = (payload: {
  projectId: string;
  unitType: "PLOT" | "BUILDING" | "WING" | "FLAT";
  unitNumber: string;
  areaSqFt: number;
  basePrice: number;
  buildingId?: string;
  wingId?: string;
  floorNumber?: number;
  direction?: string;
}) => api.post("/unit", payload);
export const getUnitsByType = (projectId: string, unitType: string) =>
  api
    .get(`/unit/project/${projectId}/type/${unitType}`)
    .then((res) => res.data);
export const getAvailableUnitsByType = (projectId: string, unitType: string) =>
  api
    .get(`/unit/project/${projectId}/type/${unitType}/available`)
    .then((res) => res.data);
export const getUnitsStatistics = (projectId: string) =>
  api.get(`/unit/project/${projectId}/statistics`).then((res) => res.data);
export const getUnitsStatisticsByBuilding = (buildingId: string) =>
  api.get(`/unit/building/${buildingId}/statistics`).then((res) => res.data);
export const getUnitsStatisticsByWing = (wingId: string) =>
  api.get(`/unit/wing/${wingId}/statistics`).then((res) => res.data);

export const getProjectWings = (projectId: string) =>
  api.get(`/wing/project/${projectId}`).then((res) => res.data);
