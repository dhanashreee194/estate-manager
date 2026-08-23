import api from "./axios";

export const uploadDocument = async (data: any) => {
  const res = await api.post("/documents", data);

  return res.data;
};
