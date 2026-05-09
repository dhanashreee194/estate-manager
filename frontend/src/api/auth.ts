import api from "./axios";
export async function inviteUser(data: {
  name: string;
  email: string;
  role: "SALES" | "ACCOUNTANT";
  password: string;
}) {
  const res = await api.post("/auth/invite", data);
  return res.data;
}

export async function resetPassword(email: string) {
  const res = await api.post("/auth/reset-password", { email });
  return res.data;
}

export async function changePassword(password: string) {
  const res = await api.post("/auth/change-password", { password });
  return res.data;
}
