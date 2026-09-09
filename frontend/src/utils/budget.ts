/** Parse lead budget from rupees or Indian shorthand (lakh / crore). */
export function parseBudget(
  value: string | number | null | undefined,
): number | undefined {
  if (value === "" || value == null) return undefined;
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }

  const raw = String(value).trim().toLowerCase().replace(/,/g, "");
  if (!raw) return undefined;

  const crore = raw.match(/^([\d.]+)\s*(cr|crore|crores)\b/);
  if (crore) {
    const n = Number(crore[1]) * 1e7;
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }

  const lakh = raw.match(/^([\d.]+)\s*(l|lac|lacs|lakh|lakhs)\b/);
  if (lakh) {
    const n = Number(lakh[1]) * 1e5;
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }

  const numeric = Number(raw.replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

/** Display budget in compact INR form. */
export function formatBudget(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value)) || Number(value) <= 0) {
    return "—";
  }
  const n = Number(value);
  if (n >= 1e7) {
    const cr = n / 1e7;
    return `₹${Number(cr.toFixed(cr >= 10 ? 1 : 2))} Cr`;
  }
  if (n >= 1e5) {
    const lakh = n / 1e5;
    return `₹${Number(lakh.toFixed(lakh >= 10 ? 1 : 2))} L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}
