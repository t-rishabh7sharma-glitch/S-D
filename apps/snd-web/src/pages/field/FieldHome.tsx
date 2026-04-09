import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  LogOut,
  MapPinned,
  Navigation,
  Radio,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { useFieldVisits } from "@/hooks/useFieldVisits";
import { getApiBase } from "@/lib/api";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function FieldHome() {
  const { session, signOut } = useSession();
  const navigate = useNavigate();
  const { visits, loading, refetch } = useFieldVisits();
  const [refreshing, setRefreshing] = useState(false);
  const apiOn = Boolean(getApiBase());

  if (!session) return null;

  const today = todayISO();
  const visitsToday = visits.filter((v) => v.at.startsWith(today)).length;
  const last = visits[0];

  return (
    <div className="flex min-h-dvh flex-col pb-28 snd-fade-in">
      {/* Top bar — partner-app style */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/90">
            Field partner
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight">Hey, {session.displayName}</h1>
          <p className="text-sm text-white/45">{session.roleTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={refreshing || loading}
            onClick={async () => {
              setRefreshing(true);
              await refetch();
              setRefreshing(false);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white/80 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/10 disabled:opacity-40"
            aria-label="Refresh visits"
          >
            <RefreshCw
              className={`h-5 w-5 ${refreshing || loading ? "animate-spin" : ""}`}
              strokeWidth={1.75}
            />
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white/80 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/10"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => {
              signOut();
              navigate("/login", { replace: true });
            }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white/80 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/10"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      {/* Online strip — like driver “you’re on duty” */}
      <div className="mx-4 mt-1 flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 px-4 py-3 ring-1 ring-emerald-500/25">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <Radio className="h-5 w-5" strokeWidth={2} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-emerald-400 ring-2 ring-[#0a0d12]" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">You&apos;re online</p>
            <p className="text-xs text-emerald-200/70">Receiving visit tasks · {session.userId}</p>
          </div>
        </div>
        <span className="rounded-full bg-black/25 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-100/90">
          On duty
        </span>
      </div>

      {/* Stats — horizontal “earnings” style */}
      <div className="mx-4 mt-5 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { label: "Visits today", value: loading ? "—" : String(visitsToday), sub: "Completed" },
          { label: "SIM kits", value: "12", sub: "This week" },
          { label: "MoMo GA", value: "28", sub: "This week" },
        ].map((s) => (
          <div
            key={s.label}
            className="min-w-[132px] shrink-0 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">{s.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">{s.value}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/35">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400/80" />
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Next stop hero — map-card like delivery apps */}
      <section className="mx-4 mt-6 overflow-hidden rounded-3xl ring-1 ring-white/10">
        <div className="relative h-36 bg-gradient-to-br from-primary/30 via-navy/40 to-[#05070b]">
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_20%,rgba(0,186,242,0.35),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(0,41,112,0.5),transparent_50%)]" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Next outlet</p>
              <p className="text-lg font-bold leading-snug">Metro Mart — CBD</p>
              <p className="text-xs text-white/50">~2.4 km · Beat LSK-CBD-01</p>
            </div>
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-navy shadow-lg shadow-black/30 transition active:scale-95"
              aria-label="Navigate"
            >
              <Navigation className="h-6 w-6" strokeWidth={2} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 bg-[#0f131a] px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-white/55">
            <MapPinned className="h-4 w-4 text-primary" />
            Tap below when you arrive
          </div>
          <Sparkles className="h-4 w-4 text-amber-300/90" />
        </div>
      </section>

      {/* Recent activity */}
      <section className="mx-4 mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white/90">Recent activity</h2>
          {!apiOn ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-300/90">
              API off · demo only
            </span>
          ) : null}
        </div>
        <div className="space-y-2">
          {loading ? (
            <p className="rounded-2xl bg-white/[0.04] px-4 py-6 text-center text-sm text-white/40">
              Loading visits…
            </p>
          ) : visits.length === 0 ? (
            <p className="rounded-2xl bg-white/[0.04] px-4 py-6 text-center text-sm text-white/40">
              No visits yet. Log your first stop — it syncs to HQ when the API is running.
            </p>
          ) : (
            visits.slice(0, 6).map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 rounded-2xl bg-white/[0.05] px-4 py-3.5 ring-1 ring-white/[0.07] transition hover:bg-white/[0.07]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <MapPinned className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{v.outlet}</p>
                  <p className="text-xs text-white/40">
                    {new Date(v.at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-white/25" />
              </div>
            ))
          )}
          {last?.notes ? (
            <p className="px-1 text-xs text-white/35">
              Last note:{" "}
              {last.notes.length > 100 ? `${last.notes.slice(0, 100)}…` : last.notes}
            </p>
          ) : null}
        </div>
      </section>

      {/* Sticky primary CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-[#0a0d12] via-[#0a0d12]/95 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-10">
        <Link
          to="/field/visit"
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-[15px] font-bold text-navy shadow-[0_12px_40px_-8px_rgba(0,186,242,0.55)] transition hover:brightness-105 active:scale-[0.99] active:brightness-95"
        >
          Log new visit
        </Link>
        <p className="mt-2 text-center text-[11px] text-white/35">Large tap targets · Works best on phone width</p>
      </div>
    </div>
  );
}
