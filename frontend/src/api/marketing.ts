import api from "./axios";
import { API_BASE } from "./baseUrl";

export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
export type ShareChannel = "WHATSAPP" | "FACEBOOK" | "INSTAGRAM";

export type MarketingCampaign = {
  id: string;
  code: string;
  title: string;
  status: CampaignStatus;
  projectId: string;
  unitId?: string | null;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaPhone?: string | null;
  imageUrl?: string | null;
  enableWhatsapp: boolean;
  enableFacebook: boolean;
  enableInstagram: boolean;
  shareCount: number;
  landingViewCount: number;
  leadCount: number;
  project?: { id: string; name: string; location?: string | null };
  unit?: {
    id: string;
    unitNumber: string;
    unitType: string;
    bhkType?: string | null;
    areaSqFt: number;
    basePrice: number;
    status: string;
    floor?: number | null;
  } | null;
  createdBy?: { id: string; name: string } | null;
  shares?: { id: string; channel: ShareChannel; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
};

export type CampaignCompose = {
  campaign: MarketingCampaign;
  caption: string;
  landingUrl: string;
  links: {
    whatsapp: { url: string; landingUrl: string } | null;
    facebook: { url: string; landingUrl: string } | null;
    instagram: {
      caption: string;
      landingUrl: string;
      copyText: string;
    } | null;
  };
};

export type CreateCampaignPayload = {
  title: string;
  projectId: string;
  unitId?: string;
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaPhone?: string;
  imageUrl?: string;
  enableWhatsapp?: boolean;
  enableFacebook?: boolean;
  enableInstagram?: boolean;
  status?: CampaignStatus;
};

export const getCampaigns = (status?: CampaignStatus) =>
  api
    .get("/marketing/campaigns", { params: status ? { status } : undefined })
    .then((r) => r.data as MarketingCampaign[]);

export const getCampaign = (id: string) =>
  api.get(`/marketing/campaigns/${id}`).then((r) => r.data as MarketingCampaign);

export const createCampaign = (data: CreateCampaignPayload) =>
  api.post("/marketing/campaigns", data).then((r) => r.data as MarketingCampaign);

export const updateCampaign = (id: string, data: Partial<CreateCampaignPayload>) =>
  api.patch(`/marketing/campaigns/${id}`, data).then((r) => r.data as MarketingCampaign);

export const setCampaignStatus = (id: string, status: CampaignStatus) =>
  api
    .post(`/marketing/campaigns/${id}/status`, { status })
    .then((r) => r.data as MarketingCampaign);

export const composeCampaign = (id: string) =>
  api
    .post(`/marketing/campaigns/${id}/compose`)
    .then((r) => r.data as CampaignCompose);

export const recordShareEvent = (id: string, channel: ShareChannel) =>
  api
    .post(`/marketing/campaigns/${id}/share-events`, { channel })
    .then((r) => r.data as MarketingCampaign);

export type AiCaptionResult = {
  title: string;
  headline: string;
  body: string;
  ctaLabel: string;
  imagePrompt: string;
};

export type AiImageResult = {
  imageUrl: string;
  imagePrompt: string;
};

export type AiGeneratePayload = {
  projectId: string;
  unitId?: string;
  comments: string;
  language?: string;
  headline?: string;
  body?: string;
};

export const generateAiCaption = (data: AiGeneratePayload) =>
  api
    .post("/marketing/campaigns/ai/caption", data)
    .then((r) => r.data as AiCaptionResult);

export const generateAiImage = (data: AiGeneratePayload) =>
  api
    .post("/marketing/campaigns/ai/image", data)
    .then((r) => r.data as AiImageResult);

export type PublicCampaign = {
  code: string;
  title: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaPhone?: string | null;
  imageUrl?: string | null;
  project: { id: string; name: string; location?: string | null };
  unit?: {
    id: string;
    unitNumber: string;
    unitType: string;
    bhkType?: string | null;
    areaSqFt: number;
    basePrice: number;
    floor?: number | null;
    status: string;
  } | null;
  companyName: string;
};

export const getPublicCampaign = async (code: string) => {
  const res = await fetch(`${API_BASE}/public/campaigns/${code}`);
  if (!res.ok) throw new Error("Campaign not found");
  return res.json() as Promise<PublicCampaign>;
};

export const submitPublicLead = async (
  code: string,
  data: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
    source?: string;
  },
  src?: string,
) => {
  const q = src ? `?src=${encodeURIComponent(src)}` : "";
  const res = await fetch(`${API_BASE}/public/campaigns/${code}/leads${q}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit enquiry");
  return res.json();
};
