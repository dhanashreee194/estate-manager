import api from "./axios";

export type LandPartner = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  panNumber?: string | null;
  aadharNumber?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
  _count?: { shares: number; payments: number };
};

export type LandParcel = {
  id: string;
  name: string;
  surveyNumber?: string | null;
  gatNumber?: string | null;
  village?: string | null;
  taluka?: string | null;
  district?: string | null;
  areaSqFt?: number | null;
  areaAcres?: number | null;
  acquisitionType: string;
  status: string;
  purchasePrice?: number | null;
  agreementDate?: string | null;
  registrationDate?: string | null;
  notes?: string | null;
  projectId?: string | null;
  project?: { id: string; name: string } | null;
  partners?: Array<{
    id: string;
    role: string;
    sharePercent?: number | null;
    landShareSqFt?: number | null;
    partner: LandPartner;
  }>;
  _count?: { payments: number };
};

export const getLandSummary = () =>
  api.get("/land/summary").then((r) => r.data);

export const getLandPartners = (all = false) =>
  api
    .get("/land/partners", { params: all ? { all: "1" } : undefined })
    .then((r) => r.data as LandPartner[]);

export const createLandPartner = (data: Partial<LandPartner> & { name: string }) =>
  api.post("/land/partners", data).then((r) => r.data);

export const deactivateLandPartner = (id: string) =>
  api.delete(`/land/partners/${id}`).then((r) => r.data);

export const getLandParcels = (params?: { status?: string; projectId?: string }) =>
  api.get("/land/parcels", { params }).then((r) => r.data as LandParcel[]);

export const createLandParcel = (data: any) =>
  api.post("/land/parcels", data).then((r) => r.data);

export const updateLandParcel = (id: string, data: any) =>
  api.patch(`/land/parcels/${id}`, data).then((r) => r.data);

export const addParcelPartner = (
  parcelId: string,
  data: {
    partnerId: string;
    role?: string;
    sharePercent?: number;
    landShareSqFt?: number;
    notes?: string;
  },
) => api.post(`/land/parcels/${parcelId}/partners`, data).then((r) => r.data);

export const removeParcelPartner = (parcelId: string, shareId: string) =>
  api.delete(`/land/parcels/${parcelId}/partners/${shareId}`).then((r) => r.data);

export const getLandPayments = (params?: {
  landParcelId?: string;
  partnerId?: string;
}) => api.get("/land/payments", { params }).then((r) => r.data);

export const createLandPayment = (data: {
  landParcelId: string;
  amount: number;
  partnerId?: string;
  date?: string;
  description?: string;
  reference?: string;
  bankAccountId?: string;
}) => api.post("/land/payments", data).then((r) => r.data);
