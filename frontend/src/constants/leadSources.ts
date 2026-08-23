/** Canonical lead intake sources (Easy Colonizer–style portals + offline) */
export const LEAD_SOURCES = [
  { value: "PORTAL_99ACRES", label: "99acres", group: "Portal" },
  { value: "MAGICBRICKS", label: "MagicBricks", group: "Portal" },
  { value: "HOUSING", label: "Housing.com", group: "Portal" },
  { value: "MAKAAN", label: "Makaan", group: "Portal" },
  { value: "FACEBOOK", label: "Facebook", group: "Social" },
  { value: "INSTAGRAM", label: "Instagram", group: "Social" },
  { value: "GOOGLE_ADS", label: "Google Ads", group: "Digital" },
  { value: "WEBSITE", label: "Website", group: "Digital" },
  { value: "WHATSAPP", label: "WhatsApp", group: "Digital" },
  { value: "WALK_IN", label: "Walk-in", group: "Offline" },
  { value: "REFERRAL", label: "Referral", group: "Offline" },
  { value: "BROKER", label: "Broker", group: "Offline" },
  { value: "OTHER", label: "Other", group: "Other" },
] as const;

export type LeadSourceValue = (typeof LEAD_SOURCES)[number]["value"];

export const LEAD_SOURCE_LABEL: Record<string, string> = Object.fromEntries(
  LEAD_SOURCES.map((s) => [s.value, s.label]),
);

export function leadSourceLabel(source?: string | null) {
  if (!source) return "Unknown";
  return LEAD_SOURCE_LABEL[source] || source;
}

/** Quick-intake chips shown on Add Lead */
export const QUICK_INTAKE_SOURCES: LeadSourceValue[] = [
  "WALK_IN",
  "PORTAL_99ACRES",
  "MAGICBRICKS",
  "HOUSING",
  "REFERRAL",
  "WHATSAPP",
];
