import api from "./axios";

export const getProjectAnalytics = async (projectId: string) => {
  console.log("🌐 Making API call to get analytics for project:", projectId);
  const res = await api.get(`/expense/${projectId}/analytics`);
  console.log("📡 API response status:", res.status);
  console.log("📦 API response data:", res.data);
  return res.data;
};
