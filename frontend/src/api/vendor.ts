import api from "./axios";

export type Vendor = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  address?: string;
  type: "LABOUR" | "MATERIAL" | "BOTH";
  isActive: boolean;
  _count?: { labours: number; inventoryInwards: number };
};

export const getVendors = (type?: string) =>
  api
    .get("/vendors", { params: type ? { type } : undefined })
    .then((r) => r.data as Vendor[]);

export const createVendor = (data: Partial<Vendor>) =>
  api.post("/vendors", data).then((r) => r.data);

export const updateVendor = (id: string, data: Partial<Vendor>) =>
  api.patch(`/vendors/${id}`, data).then((r) => r.data);

export const deactivateVendor = (id: string) =>
  api.delete(`/vendors/${id}`).then((r) => r.data);

export const getVendor = (id: string) =>
  api.get(`/vendors/${id}`).then((r) => r.data);

export const recordVendorPayment = (
  id: string,
  data: {
    projectId: string;
    amount: number;
    date: string;
    description?: string;
    gstRate?: number;
    type?: string;
  },
) => api.post(`/vendors/${id}/payment`, data).then((r) => r.data);
