import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000", // backend URL
});

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "SALES" | "ACCOUNTANT";
    companyId: string;
    companyName: string;
  };
}

export async function loginApi(email: string, password: string) {
  const res = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return res.data;
}

export interface SignupPayload {
  companyName: string;
  companyEmail: string;
  adminName: string;
  adminEmail: string;
  password: string;
}

export async function signupApi(payload: SignupPayload) {
  const res = await api.post<LoginResponse>("/auth/signup", payload);
  return res.data;
}
