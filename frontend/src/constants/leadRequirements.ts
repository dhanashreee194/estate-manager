/** Common buyer requirements for lead intake */
export const LEAD_REQUIREMENTS = [
  "1BHK",
  "2BHK",
  "3BHK",
  "4BHK",
  "5BHK",
  "Plot",
  "Villa",
  "Shop",
  "Office",
  "Other",
] as const;

export type LeadRequirementValue = (typeof LEAD_REQUIREMENTS)[number];

export function isPresetRequirement(value: string | null | undefined) {
  if (!value) return false;
  return (LEAD_REQUIREMENTS as readonly string[]).includes(value);
}
