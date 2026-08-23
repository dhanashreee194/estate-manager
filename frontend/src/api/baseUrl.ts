/** Backend API origin. Prefer VITE_API_URL (set at build time on Render). */
function resolveApiBase(): string {
  const fromEnv = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
    /\/$/,
    "",
  );
  if (fromEnv) return fromEnv;

  if (
    typeof window !== "undefined" &&
    window.location.hostname.endsWith("onrender.com")
  ) {
    // Must match the Render API service name in render.yaml
    return "https://raut-estate-api.onrender.com";
  }

  return "http://localhost:3000";
}

export const API_BASE = resolveApiBase();
