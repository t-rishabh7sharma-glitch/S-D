export type Workspace = "bo" | "agent";
export type RoleKey = "ADMIN" | "TDR" | "ZBM" | "DSA";

export type Session = {
  userId: string;
  roleKey: RoleKey;
  roleTitle: string;
  displayName: string;
  workspace: Workspace;
  loginAt: string;
};

const KEY = "snd_demo_session";

const USERS: Record<
  string,
  { workspace: Workspace; roleKey: RoleKey; roleTitle: string; displayName: string }
> = {
  "ADMIN-101": {
    workspace: "bo",
    roleKey: "ADMIN",
    roleTitle: "Administrator",
    displayName: "John",
  },
  "TDR-101": {
    workspace: "bo",
    roleKey: "TDR",
    roleTitle: "Territory Development Rep",
    displayName: "Sarah",
  },
  "ZBM-101": {
    workspace: "bo",
    roleKey: "ZBM",
    roleTitle: "Zonal Business Manager",
    displayName: "Michael",
  },
  "SBM-101": {
    workspace: "bo",
    roleKey: "ZBM",
    roleTitle: "Zonal Business Manager",
    displayName: "Michael",
  },
  "DSA-101": {
    workspace: "agent",
    roleKey: "DSA",
    roleTitle: "Direct Sales Agent",
    displayName: "Chanda",
  },
  "AGENT-101": {
    workspace: "agent",
    roleKey: "DSA",
    roleTitle: "Direct Sales Agent",
    displayName: "Alex",
  },
};

export function getSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function setSession(s: Session): void {
  sessionStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSession(): void {
  sessionStorage.removeItem(KEY);
}

/** Password ignored — demo only */
export function login(employeeId: string, _password: string): { ok: true; session: Session } | { ok: false; error: string } {
  const id = employeeId.trim().toUpperCase();
  const profile = USERS[id];
  if (!profile) return { ok: false, error: "Invalid employee ID." };
  const session: Session = {
    userId: id,
    roleKey: profile.roleKey,
    roleTitle: profile.roleTitle,
    displayName: profile.displayName,
    workspace: profile.workspace,
    loginAt: new Date().toISOString(),
  };
  return { ok: true, session };
}

export function defaultPath(workspace: Workspace): string {
  return workspace === "bo" ? "/bo/dashboard" : "/field";
}
