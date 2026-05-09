import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
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
