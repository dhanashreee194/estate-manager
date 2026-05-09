import api from "./axios";

export const getCompanyAnalytics = async () => {
  console.log("🌐 Making API call to get company analytics");
  const res = await api.get("/company-reports/analytics");
  console.log("📡 Company analytics response status:", res.status);
  console.log("📦 Company analytics response data:", res.data);
  return res.data;
};
