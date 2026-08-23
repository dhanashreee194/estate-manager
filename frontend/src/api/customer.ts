import api from "./axios";

// export const getCustomers = async () => {
//   const res = await api.get("/customer");
//   return res.data;
// };

export const createCustomer = async (data: any) => {
  const res = await api.post("/customers", data);
  return res.data;
};

export const getCustomer = async (id: string) => {
  const res = await api.get(`/customers/${id}`);
  return res.data;
};

export const getCustomers = async (search?: string) => {
  const res = await api.get("/customers", {
    params: {
      search,
    },
  });

  return res.data;
};
export const updateCustomer = async (id: string, data: any) => {
  const res = await api.patch(`/customers/${id}`, data);
  return res.data;
};
