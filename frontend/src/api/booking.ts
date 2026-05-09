import api from "./axios";

// Get bookings
export const getProjectBookings = (projectId: string) =>
  api.get(`/booking/project/${projectId}`).then((res) => res.data);

// Create booking
export const createBooking = async (data: any) => {
  const res = await api.post("/booking", data);
  return res.data; // 👈 THIS IS THE FIX
};
// Get available units
export const getAvailableUnits = (projectId: string) =>
  api.get(`/unit/project/${projectId}/available`).then((res) => res.data);
export const cancelBooking = async (id: string) => {
  const res = await api.post(`/booking/${id}/cancel`);
  return res.data;
};

export const updateBooking = async (id: string, data: any) => {
  const res = await api.put(`/booking/${id}`, data);
  return res.data;
};
