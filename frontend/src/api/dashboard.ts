import { apiFetch } from "./http";

export async function getAdminDashboard() {
  const res = await apiFetch("/dashboard");

  if (!res.ok) {
    throw new Error("Failed to load dashboard");
  }

  return res.json();
}
