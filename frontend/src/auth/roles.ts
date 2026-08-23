export type AppRole = "ADMIN" | "SUPERVISOR" | "SALES" | "ACCOUNTANT";

export type NavKey =
  | "dashboard"
  | "projects"
  | "inventory"
  | "vendors"
  | "brokers"
  | "finance"
  | "land"
  | "collections"
  | "reminders"
  | "marketing"
  | "bookings"
  | "users"
  | "leads"
  | "reports"
  | "advancedReports";

export type FeatureKey =
  | NavKey
  | "inviteUser"
  | "createProject"
  | "aiMarketing";

const ALL: AppRole[] = ["ADMIN", "SUPERVISOR", "SALES", "ACCOUNTANT"];

/** Which roles can see / use each feature. ADMIN always allowed. */
export const FEATURE_ROLES: Record<FeatureKey, AppRole[]> = {
  dashboard: ALL,
  projects: ALL,
  inventory: ["ADMIN", "SUPERVISOR", "ACCOUNTANT"],
  vendors: ["ADMIN", "SUPERVISOR", "ACCOUNTANT"],
  brokers: ["ADMIN", "SALES", "ACCOUNTANT"],
  finance: ["ADMIN", "ACCOUNTANT"],
  land: ["ADMIN", "SUPERVISOR", "ACCOUNTANT"],
  collections: ["ADMIN", "SALES", "ACCOUNTANT"],
  reminders: ALL,
  marketing: ["ADMIN", "SALES"],
  bookings: ["ADMIN", "SALES", "ACCOUNTANT"],
  users: ["ADMIN", "SALES", "ACCOUNTANT"],
  leads: ["ADMIN", "SALES"],
  reports: ALL,
  advancedReports: ["ADMIN", "SUPERVISOR", "ACCOUNTANT", "SALES"],
  inviteUser: ["ADMIN"],
  createProject: ["ADMIN", "SUPERVISOR"],
  aiMarketing: ["ADMIN", "SALES"],
};

export const NAV_ITEMS: { key: NavKey; to: string; end?: boolean }[] = [
  { key: "dashboard", to: "/dashboard", end: true },
  { key: "projects", to: "/dashboard/projects" },
  { key: "inventory", to: "/dashboard/inventory" },
  { key: "vendors", to: "/dashboard/vendors" },
  { key: "brokers", to: "/dashboard/brokers" },
  { key: "finance", to: "/dashboard/finance" },
  { key: "land", to: "/dashboard/land" },
  { key: "collections", to: "/dashboard/collections" },
  { key: "reminders", to: "/dashboard/reminders" },
  { key: "marketing", to: "/dashboard/marketing" },
  { key: "bookings", to: "/dashboard/bookings" },
  { key: "users", to: "/dashboard/users" },
  { key: "leads", to: "/dashboard/leads" },
  { key: "reports", to: "/dashboard/reports" },
  { key: "advancedReports", to: "/dashboard/comprehensive-reports" },
];

export function getStoredUser(): { role?: string; name?: string } | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getCurrentRole(): AppRole | null {
  const role = getStoredUser()?.role?.toUpperCase();
  if (
    role === "ADMIN" ||
    role === "SUPERVISOR" ||
    role === "SALES" ||
    role === "ACCOUNTANT"
  ) {
    return role;
  }
  return null;
}

export function canAccess(feature: FeatureKey, role?: AppRole | null): boolean {
  const r = role ?? getCurrentRole();
  if (!r) return false;
  if (r === "ADMIN") return true;
  return FEATURE_ROLES[feature].includes(r);
}

/** Map a path prefix to a feature for route guards. */
export function featureForPath(pathname: string): FeatureKey | null {
  if (pathname === "/dashboard" || pathname === "/dashboard/") return "dashboard";
  const map: [string, FeatureKey][] = [
    ["/dashboard/comprehensive-reports", "advancedReports"],
    ["/dashboard/projects", "projects"],
    ["/dashboard/inventory", "inventory"],
    ["/dashboard/vendors", "vendors"],
    ["/dashboard/brokers", "brokers"],
    ["/dashboard/finance", "finance"],
    ["/dashboard/land", "land"],
    ["/dashboard/collections", "collections"],
    ["/dashboard/reminders", "reminders"],
    ["/dashboard/marketing", "marketing"],
    ["/dashboard/bookings", "bookings"],
    ["/dashboard/users", "users"],
    ["/dashboard/leads", "leads"],
    ["/dashboard/reports", "reports"],
  ];
  for (const [prefix, key] of map) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return key;
  }
  return null;
}
