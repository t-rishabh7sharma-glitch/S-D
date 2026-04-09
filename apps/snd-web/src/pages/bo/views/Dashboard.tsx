import { ArrowUpRight, Smartphone, Wallet, Users, AlertTriangle, Droplets, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { useBoQuery } from "@/hooks/useBoQuery";
import { fallbackDashboard } from "@/data/boFallback";
import type { DashboardPayload } from "@/types/api";

export function BoDashboard() {
  const { data, loading, fromApi, initialDone } = useBoQuery<DashboardPayload>(
    "/api/bo/dashboard",
    fallbackDashboard,
  );
  const k = data.kpis;

  if (!initialDone) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 snd-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Commercial pulse, leaderboard, and risk signals.{" "}
            {fromApi ? (
              <span className="font-semibold text-emerald-700">Connected to API.</span>
            ) : (
              <span>Using embedded snapshot — start `snd-api` for live data.</span>
            )}
          </p>
        </div>
        {loading ? (
          <span className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
            Refreshing…
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute right-4 top-4 rounded-lg bg-primary/12 p-2 text-primary">
            <Smartphone className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            SIM activations (MTD)
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums text-ink">
            {k.simMtd.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight className="h-3.5 w-3.5" />+{k.simDeltaPct}% vs last month
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute right-4 top-4 rounded-lg bg-primary/12 p-2 text-primary">
            <Wallet className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            MoMo gross adds
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums text-ink">
            {k.momoMtd.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight className="h-3.5 w-3.5" />+{k.momoDeltaPct}% vs last month
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute right-4 top-4 rounded-lg bg-navy/10 p-2 text-navy">
            <Users className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Active DSAs
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums text-ink">
            {k.activeDsas.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-ink-muted">Across all active beats (demo)</div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute right-4 top-4 rounded-lg bg-amber-500/15 p-2 text-amber-700">
            <Droplets className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Float adequacy
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums text-ink">{k.floatAdequacyPct}%</div>
          <div className="mt-2 text-xs text-ink-muted">Outlets meeting min float</div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-ink">Leaderboard</h2>
              <p className="text-sm text-ink-muted">Top agents by gross adds</p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3 text-right">Gross adds</th>
                  <th className="px-4 py-3">Zone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.leaderboard.map((r) => (
                  <tr key={r.r} className="bg-white hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold tabular-nums text-primary">#{r.r}</td>
                    <td className="px-4 py-3 font-medium text-ink">{r.a}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">{r.ga}</td>
                    <td className="px-4 py-3 text-ink-secondary">{r.z}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-amber-50/50 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <h3 className="text-sm font-bold text-ink">Exceptions</h3>
            </div>
            <ul className="divide-y divide-slate-100 text-sm">
              {data.exceptions.map((e, i) => (
                <li key={i} className="px-4 py-3">
                  <div className="font-medium text-ink">{e.type}</div>
                  <div className="text-xs text-ink-muted">{e.agent}</div>
                  <div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
                    {e.st.replace(/_/g, " ")}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-ink">
              Float stress
            </div>
            <ul className="divide-y divide-slate-100 text-sm">
              {data.floatAlerts.map((f, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-medium text-ink">{f.a}</div>
                    <div className="text-xs text-ink-muted">
                      K {f.bal} / min {f.th}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      f.sev === "critical" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {f.sev}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
