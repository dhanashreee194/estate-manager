import api from "./axios";

export interface InviteUserPayload {
  name: string;
  email: string;
  password: string;
  role: "SUPERVISOR" | "SALES" | "ACCOUNTANT";
}

export const inviteUser = async (payload: InviteUserPayload) => {
  const res = await api.post("/auth/invite", payload);
  return res.data;
};
