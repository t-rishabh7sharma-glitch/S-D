import type { RoleKey } from "./session";

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
