import api from "./axios";

export type Broker = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  panNumber?: string;
  address?: string;
  commissionRate: number;
  isActive: boolean;
  _count?: { bookings: number; commissions: number };
};

export const getBrokers = (all = false) =>
  api
    .get("/brokers", { params: all ? { all: "1" } : undefined })
    .then((r) => r.data as Broker[]);

export const createBroker = (data: {
  name: string;
  phone: string;
  email?: string;
  panNumber?: string;
  address?: string;
  commissionRate: number;
}) => api.post("/brokers", data).then((r) => r.data);

export const updateBroker = (id: string, data: Partial<Broker>) =>
  api.patch(`/brokers/${id}`, data).then((r) => r.data);

export const deactivateBroker = (id: string) =>
  api.delete(`/brokers/${id}`).then((r) => r.data);

export const getBroker = (id: string) =>
  api.get(`/brokers/${id}`).then((r) => r.data);

export const getCommissions = (params?: {
  status?: string;
  brokerId?: string;
}) => api.get("/brokers/commissions", { params }).then((r) => r.data);

export const getCommissionSummary = () =>
  api.get("/brokers/commissions/summary").then((r) => r.data);

export const markCommissionPaid = (
  id: string,
  data?: { paidAmount?: number; notes?: string; bankAccountId?: string },
) => api.post(`/brokers/commissions/${id}/pay`, data || {}).then((r) => r.data);
