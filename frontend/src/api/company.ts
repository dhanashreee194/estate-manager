import api from "./axios";
import { API_BASE } from "./baseUrl";

export type CompanySettings = {
  id: string;
  name: string;
  email: string;
  logoUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  invoicePrefix?: string | null;
  invoiceFooter?: string | null;
  billTitle?: string | null;
  showGstOnDocs?: boolean;
  createdAt?: string;
};

export type UpdateCompanyPayload = Partial<
  Omit<CompanySettings, "id" | "email" | "createdAt">
>;

export const getCompanySettings = async (): Promise<CompanySettings> => {
  const res = await api.get("/company/me");
  return res.data;
};

export const updateCompanySettings = async (
  payload: UpdateCompanyPayload,
): Promise<CompanySettings> => {
  const res = await api.patch("/company/me", payload);
  return res.data;
};

export const uploadCompanyLogo = async (
  file: File,
): Promise<CompanySettings> => {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/company/logo", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/** Absolute URL for company logo stored as /uploads/... */
export function companyAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_BASE.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
