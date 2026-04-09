const TOKEN_KEY = "snd_api_token";

export function getApiBase(): string | undefined {
  const explicit = import.meta.env.VITE_API_BASE as string | undefined;
  if (explicit === "false" || explicit === "0") return undefined;
  if (explicit && explicit.length > 0) return explicit.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://127.0.0.1:4000";
  return undefined;
}

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Quick reachability check (no auth). */
export async function checkApiHealth(): Promise<boolean> {
  const base = getApiBase();
  if (!base) return false;
  try {
    const r = await fetch(`${base}/api/health`, { method: "GET" });
    return r.ok;
  } catch {
    return false;
  }
}

export function setToken(t: string | null): void {
  try {
    if (t) sessionStorage.setItem(TOKEN_KEY, t);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const base = getApiBase();
  if (!base) return { ok: false, status: 0, error: "API disabled" };
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(init.headers);
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const tok = getToken();
  if (tok) headers.set("Authorization", `Bearer ${tok}`);
  let body = init.body;
  if (init.json !== undefined) body = JSON.stringify(init.json);
  try {
    const res = await fetch(url, { ...init, headers, body });
    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        data = text;
      }
    }
    if (!res.ok) {
      const err =
        typeof data === "object" && data && "error" in data
          ? String((data as { error: string }).error)
          : res.statusText;
      return { ok: false, status: res.status, error: err };
    }
    return { ok: true, data: data as T };
  } catch (e) {
    return { ok: false, status: 0, error: e instanceof Error ? e.message : "Network error" };
  }
}
