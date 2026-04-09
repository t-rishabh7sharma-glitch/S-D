import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, getApiBase, getToken, setToken } from "@/lib/api";
import {
  clearSession,
  getSession,
  login,
  setSession,
  type Session,
} from "@/lib/session";

type Ctx = {
  session: Session | null;
  ready: boolean;
  signIn: (
    id: string,
    password: string,
  ) => Promise<{ ok: true; session: Session } | { ok: false; error: string }>;
  signOut: () => void;
};

const SessionContext = createContext<Ctx | null>(null);

type MeResponse = { user: Session };

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setS] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const base = getApiBase();
      const tok = getToken();
      if (base && tok) {
        const r = await apiFetch<MeResponse>("/api/auth/me", { method: "GET" });
        if (!cancelled && r.ok) {
          setS(r.data.user);
          setSession(r.data.user);
          setReady(true);
          return;
        }
        if (!cancelled) {
          setToken(null);
          clearSession();
          setS(null);
          setReady(true);
          return;
        }
      }
      if (!cancelled) {
        setS(getSession());
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (id: string, password: string) => {
    const tid = id.trim().toUpperCase();
    if (!tid) {
      return { ok: false as const, error: "Enter your employee ID." };
    }
    const base = getApiBase();
    if (base) {
      const r = await apiFetch<{ token: string; user: Session }>("/api/auth/login", {
        method: "POST",
        json: { employeeId: tid, password },
      });
      if (r.ok) {
        setToken(r.data.token);
        setSession(r.data.user);
        setS(r.data.user);
        return { ok: true as const, session: r.data.user };
      }
      if (r.status !== 0) {
        return { ok: false as const, error: r.error || "Login failed" };
      }
    }
    const local = login(tid, password);
    if (!local.ok) return local;
    setToken(null);
    setSession(local.session);
    setS(local.session);
    return { ok: true as const, session: local.session };
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    clearSession();
    setS(null);
  }, []);

  const v = useMemo(
    () => ({ session, ready, signIn, signOut }),
    [session, ready, signIn, signOut],
  );

  return <SessionContext.Provider value={v}>{children}</SessionContext.Provider>;
}

export function useSession(): Ctx {
  const c = useContext(SessionContext);
  if (!c) throw new Error("useSession outside SessionProvider");
  return c;
}
