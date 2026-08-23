import api from "./axios";

export type Reminder = {
  id: string;
  type: string;
  channel: string;
  status: string;
  entityType: string;
  entityId?: string | null;
  title: string;
  message?: string | null;
  phone?: string | null;
  dueAt: string;
  sentAt?: string | null;
  completedAt?: string | null;
};

export type ReminderCompose = {
  id: string;
  phone: string | null;
  message: string;
  waUrl: string | null;
  smsUrl: string | null;
  title: string;
  type: string;
  status: string;
};

export const getReminders = (params?: {
  status?: string;
  type?: string;
  dueOnly?: boolean;
}) =>
  api
    .get("/reminders", {
      params: {
        status: params?.status,
        type: params?.type,
        dueOnly: params?.dueOnly ? "1" : undefined,
      },
    })
    .then((r) => r.data as Reminder[]);

export const getReminderSummary = () =>
  api.get("/reminders/summary").then((r) => r.data);

export const generateReminders = () =>
  api.post("/reminders/generate").then((r) => r.data);

export const createReminder = (data: {
  type: string;
  title: string;
  message?: string;
  phone?: string;
  dueAt: string;
  channel?: string;
  entityType?: string;
  entityId?: string;
}) => api.post("/reminders", data).then((r) => r.data);

export const composeReminder = (id: string) =>
  api.get(`/reminders/${id}/compose`).then((r) => r.data as ReminderCompose);

export const markReminderSent = (id: string, channel?: string) =>
  api
    .post(`/reminders/${id}/mark-sent`, channel ? { channel } : {})
    .then((r) => r.data);

export const markReminderDone = (id: string) =>
  api.post(`/reminders/${id}/done`).then((r) => r.data);

export const skipReminder = (id: string) =>
  api.post(`/reminders/${id}/skip`).then((r) => r.data);
