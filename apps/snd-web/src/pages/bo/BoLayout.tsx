import { useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { BoSidebar } from "@/components/bo/BoSidebar";
import { SyncStatusStrip } from "@/components/SyncStatusStrip";
import { ToastHost } from "@/components/bo/ToastHost";
import { allowedBoRoutes } from "@/lib/rbac";
import { Button } from "@/components/ui/Button";

function formatDate() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

export function BoLayout() {
  const { session, signOut } = useSession();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);

  const allowed = useMemo(
    () => new Set(allowedBoRoutes(session!.roleKey)),
    [session],
  );

  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-surface text-ink">
      <div className="hidden lg:block">
        <BoSidebar allowed={allowed} />
      </div>

      {drawer ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-navy/40 lg:hidden"
            aria-label="Close menu"
            onClick={() => setDrawer(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[min(280px,88vw)] shadow-lift lg:hidden">
            <BoSidebar allowed={allowed} onNavigate={() => setDrawer(false)} />
          </div>
        </>
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <SyncStatusStrip surface="bo" />
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-navy lg:hidden"
              onClick={() => setDrawer((d) => !d)}
              aria-expanded={drawer}
              aria-controls={drawer ? "bo-nav" : undefined}
            >
              {drawer ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-ink">
                Welcome back, {session.displayName}
              </div>
              <div className="truncate text-xs text-ink-muted">
                {session.roleTitle} · {session.userId}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-secondary sm:inline">
              Scope: National (demo)
            </span>
            <span className="hidden text-xs text-ink-muted md:inline">{formatDate()}</span>
            <Button
              variant="secondary"
              className="h-9 px-3 text-xs"
              onClick={() => {
                signOut();
                navigate("/login", { replace: true });
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="snd-fade-in mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastHost />
    </div>
  );
}
