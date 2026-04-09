import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useSession } from "@/context/SessionContext";
import { defaultPath } from "@/lib/session";
import { LoginPage } from "@/pages/Login";
import { BoLayout } from "@/pages/bo/BoLayout";
import { BoOutlet } from "@/pages/bo/BoOutlet";
import { FieldLayout } from "@/pages/field/FieldLayout";
import { FieldHome } from "@/pages/field/FieldHome";
import { FieldVisit } from "@/pages/field/FieldVisit";

function RequireSession({ children }: { children: ReactNode }) {
  const { session, ready } = useSession();
  const loc = useLocation();
  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-navy text-sm font-extrabold tracking-wider text-white shadow-lg shadow-primary/25 ring-4 ring-primary/10">
          SND
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-ink-secondary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Loading workspace…
        </div>
      </div>
    );
  }
  if (!session) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}

function RequireBo({ children }: { children: ReactNode }) {
  const { session, ready } = useSession();
  if (!ready || !session) return null;
  if (session.workspace !== "bo") {
    return <Navigate to="/field" replace />;
  }
  return children;
}

function RequireField({ children }: { children: ReactNode }) {
  const { session, ready } = useSession();
  if (!ready || !session) return null;
  if (session.workspace !== "agent") {
    return (
      <Navigate
        to="/bo/dashboard"
        replace
        state={{ toast: "Switch to a field account (DSA / AGENT) for the mobile shell." }}
      />
    );
  }
  return children;
}

function RootGate() {
  const { session, ready } = useSession();
  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return <Navigate to={defaultPath(session.workspace)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootGate />} />

      <Route
        path="/bo"
        element={
          <RequireSession>
            <RequireBo>
              <BoLayout />
            </RequireBo>
          </RequireSession>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path=":module" element={<BoOutlet />} />
      </Route>

      <Route
        path="/field"
        element={
          <RequireSession>
            <RequireField>
              <FieldLayout />
            </RequireField>
          </RequireSession>
        }
      >
        <Route index element={<FieldHome />} />
        <Route path="visit" element={<FieldVisit />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
