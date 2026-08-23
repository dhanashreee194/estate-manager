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

export const downloadBookingAgreement = async (bookingId: string) => {
  const lang = localStorage.getItem("estate-manager-lang") || "en";
  const res = await api.get(`/booking/${bookingId}/agreement`, {
    responseType: "blob",
    params: { lang },
  });
  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `allotment-agreement-${bookingId.slice(0, 8)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
