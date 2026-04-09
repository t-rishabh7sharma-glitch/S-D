import { Card } from "@/components/ui/Card";
import { HeatmapChart, TrendChart } from "@/components/bo/ReportCharts";
import { useBoQuery } from "@/hooks/useBoQuery";
import { fallbackReports } from "@/data/boFallback";

type Res = typeof fallbackReports;

export function BoReports() {
  const { data, loading, fromApi } = useBoQuery<Res>("/api/bo/reports", fallbackReports);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Analytics</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Zone heatmap and national trend — MVP charts, export comes in production.
          </p>
        </div>
        {fromApi ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
            API
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-ink-secondary">
            Snapshot
          </span>
        )}
      </div>
      {loading ? <p className="text-sm text-ink-muted">Loading…</p> : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-bold text-ink">Achievement by zone</h2>
          <HeatmapChart data={data.heatmap} />
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-bold text-ink">Target vs actual</h2>
          <TrendChart data={data.trend} />
        </Card>
      </div>
    </div>
  );
}
