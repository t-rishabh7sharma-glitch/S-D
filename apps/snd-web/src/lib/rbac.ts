import type { RoleKey, Session } from "./session";

export type BoRoute =
  | "dashboard"
  | "hierarchy"
  | "users"
  | "territory"
  | "kpis"
  | "targets"
  | "incentives"
  | "roles"
  | "reports";

const MAP: Record<RoleKey, BoRoute[]> = {
  ADMIN: [
    "dashboard",
    "hierarchy",
    "users",
    "territory",
    "kpis",
    "targets",
    "incentives",
    "roles",
    "reports",
  ],
  TDR: ["dashboard", "users", "territory", "reports"],
  ZBM: ["dashboard", "users", "targets", "reports"],
  DSA: [],
};

export function allowedBoRoutes(role: RoleKey): BoRoute[] {
  return MAP[role] ?? MAP.ADMIN;
}

export function canAccessBoRoute(role: RoleKey, route: BoRoute): boolean {
  return allowedBoRoutes(role).includes(route);
}

export function isAdminOnly(role: RoleKey): boolean {
  return role === "ADMIN";
}

/** Preferred first screen after sign-in (must be allowed for the role). */
const ROLE_HOME_BO: Partial<Record<RoleKey, BoRoute>> = {
  ADMIN: "dashboard",
  TDR: "users",
  ZBM: "targets",
};

/**
 * Single entry routing: one login, then land on the workspace + module that matches the user.
 * Field agents → `/field`. Back office → role-appropriate `/bo/...` (validated against RBAC).
 */
export function homePathForSession(session: Session): string {
  if (session.workspace === "agent") return "/field";
  const role = session.roleKey;
  const preferred = ROLE_HOME_BO[role] ?? "dashboard";
  if (canAccessBoRoute(role, preferred)) return `/bo/${preferred}`;
  const first = allowedBoRoutes(role)[0];
  return `/bo/${first}`;
}
