import api from "./axios";

export interface InviteUserPayload {
  name: string;
  email: string;
  password: string;
  role: "SUPERVISOR" | "SALES" | "ACCOUNTANT";
}

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const inviteUser = async (payload: InviteUserPayload) => {
  const res = await api.post("/auth/invite", payload);
  return res.data;
};

export const getTeamUsers = async (): Promise<TeamUser[]> => {
  const res = await api.get("/auth/users");
  return Array.isArray(res.data) ? res.data : [];
};
