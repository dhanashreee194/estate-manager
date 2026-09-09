/** Split stored workDetails into display/edit items. */
export function parseWorkDetails(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];

  const raw = text.trim();
  let parts = raw
    .split(/\r?\n+|;\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Single blob with inline numbering: "1) foo 2) bar" or "1. foo 2. bar"
  if (parts.length === 1) {
    const numbered = raw
      .split(/(?=\b\d+[).]\s+)/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (numbered.length > 1) parts = numbered;
  }

  return parts
    .map((s) => s.replace(/^(?:[-•*]|\d+[).])\s*/, "").trim())
    .filter(Boolean);
}

/** Persist work items as one line per item. */
export function serializeWorkDetails(items: string[]): string {
  return items
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
}
