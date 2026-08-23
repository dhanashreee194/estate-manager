/** Application user roles (stored as string on User.role). */
export const AppRoles = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  SALES: 'SALES',
  ACCOUNTANT: 'ACCOUNTANT',
} as const;

export type AppRole = (typeof AppRoles)[keyof typeof AppRoles];

/** Full access — always allowed by RolesGuard. */
export const ADMIN = AppRoles.ADMIN;

/** Site / operations (inventory, labour, daily reports, vendors). */
export const SITE_OPS: AppRole[] = [
  AppRoles.ADMIN,
  AppRoles.SUPERVISOR,
];

/** Sales CRM (leads, bookings, marketing, brokers). */
export const SALES_TEAM: AppRole[] = [
  AppRoles.ADMIN,
  AppRoles.SALES,
];

/** Finance / collections / ledger. */
export const FINANCE_TEAM: AppRole[] = [
  AppRoles.ADMIN,
  AppRoles.ACCOUNTANT,
];

/** Broad read access for authenticated staff. */
export const ALL_STAFF: AppRole[] = [
  AppRoles.ADMIN,
  AppRoles.SUPERVISOR,
  AppRoles.SALES,
  AppRoles.ACCOUNTANT,
];

/** Roles an admin may invite. */
export const INVITABLE_ROLES: AppRole[] = [
  AppRoles.SUPERVISOR,
  AppRoles.SALES,
  AppRoles.ACCOUNTANT,
];
