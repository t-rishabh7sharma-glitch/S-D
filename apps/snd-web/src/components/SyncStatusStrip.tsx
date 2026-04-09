import { useEffect, useState } from "react";
import { CloudOff, Loader2, Radio, Wifi } from "lucide-react";
import { checkApiHealth, getApiBase } from "@/lib/api";
import { useSession } from "@/context/SessionContext";

type Health = "checking" | "up" | "down" | "disabled";

/**
 * Surfaces HQ/API connectivity so users know if data & visits are live (MVP assurance).
 */
export function SyncStatusStrip({ surface }: { surface: "bo" | "field" }) {
  const { session, ready } = useSession();
  const [health, setHealth] = useState<Health>("checking");

  useEffect(() => {
    if (!ready) return;
    if (!getApiBase()) {
      setHealth("disabled");
      return;
    }
    let cancelled = false;
    const run = async () => {
      const ok = await checkApiHealth();
      if (!cancelled) setHealth(ok ? "up" : "down");
    };
    setHealth("checking");
    void run();
    const id = window.setInterval(run, 20_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [ready]);

  if (!ready || !session) return null;
  if (surface === "bo" && session.workspace !== "bo") return null;
  if (surface === "field" && session.workspace !== "agent") return null;

  if (health === "disabled") {
    const msg =
      surface === "bo"
        ? "Demo mode — BO screens use embedded snapshots. Run snd-api in dev for live JSON + auth."
        : "Demo mode — visits won’t persist until snd-api is running with VITE_API_BASE set.";
    return (
      <div
        className={`flex items-center justify-center gap-2 border-b px-4 py-2 text-center text-[11px] font-semibold leading-snug ${
          surface === "bo"
            ? "border-amber-200/80 bg-amber-50/90 text-amber-950"
            : "border-amber-500/25 bg-amber-500/10 text-amber-100/95"
        }`}
        role="status"
      >
        <CloudOff className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
        {msg}
      </div>
    );
  }

  if (health === "checking") {
    return (
      <div
        className={`flex items-center justify-center gap-2 border-b px-4 py-2 text-[11px] font-semibold ${
          surface === "bo"
            ? "border-slate-200/80 bg-slate-50 text-ink-secondary"
            : "border-white/10 bg-white/[0.04] text-white/50"
        }`}
        role="status"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        Checking HQ connection…
      </div>
    );
  }

  if (health === "up") {
    return (
      <div
        className={`flex items-center justify-center gap-2 border-b px-4 py-2 text-[11px] font-semibold ${
          surface === "bo"
            ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-900"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
        }`}
        role="status"
      >
        <Wifi className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {surface === "bo" ? "HQ API online — BO data loads from server." : "HQ online — visits sync to back office."}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center gap-2 border-b px-4 py-2 text-center text-[11px] font-semibold leading-snug ${
        surface === "bo"
          ? "border-amber-200/80 bg-amber-50 text-amber-950"
          : "border-rose-500/35 bg-rose-500/10 text-rose-100"
      }`}
      role="alert"
    >
      <Radio className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {surface === "bo"
        ? "Can’t reach API — showing embedded snapshots. Start snd-api on :4000."
        : "Can’t reach HQ — you can still finish visits; they’ll save locally until API is back."}
    </div>
  );
}
