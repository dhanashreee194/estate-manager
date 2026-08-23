import api from "./axios";

export const uploadKyc = async (customerId: string, data: any) => {
  const res = await api.post(`/customers/${customerId}/kyc`, data);

  return res.data;
};

export const getCustomerKyc = async (customerId: string) => {
  const res = await api.get(`/customers/${customerId}/kyc`);

  return res.data;
};
export const verifyKyc = async (id: string, verified: boolean) => {
  const res = await api.patch(`/kyc/${id}/verify`, { verified });

  return res.data;
};
