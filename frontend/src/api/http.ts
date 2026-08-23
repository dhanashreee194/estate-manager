import { API_BASE } from "./baseUrl";

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
}
