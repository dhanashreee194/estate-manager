import axios from "axios";
import { API_BASE } from "./baseUrl";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    if (!config.headers) {
      config.headers = {} as any;
    }

    console.log("👉 TOKEN SENT:", token);
    console.log("👉 URL:", config.url);

    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

export default api;
