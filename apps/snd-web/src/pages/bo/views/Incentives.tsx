import { Card } from "@/components/ui/Card";
import { useBoQuery } from "@/hooks/useBoQuery";
import { fallbackIncentives } from "@/data/boFallback";

type Slab = { min: number; max: number | null; rate: string; bonus: string };
type Plan = { name: string; role: string; product: string; slabs: Slab[] };
type Res = { incentives: Plan[] };

const fb: Res = { incentives: fallbackIncentives as Plan[] };

export function BoIncentives() {
  const { data, loading } = useBoQuery<Res>("/api/bo/incentives", fb);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Incentives</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Slab ladders and bonus rules (operational reference for payouts).
        </p>
      </div>
      {loading ? <p className="text-sm text-ink-muted">Loading…</p> : null}
      <div className="grid gap-5 lg:grid-cols-2">
        {data.incentives.map((p) => (
          <Card key={p.name} className="p-0 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
              <h2 className="font-bold text-ink">{p.name}</h2>
              <p className="text-xs text-ink-muted">
                Role: <span className="font-semibold text-ink-secondary">{p.role}</span> · Product:{" "}
                <span className="font-semibold text-primary">{p.product}</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                  <tr>
                    <th className="px-5 py-2">Min</th>
                    <th className="px-5 py-2">Max</th>
                    <th className="px-5 py-2">Rate</th>
                    <th className="px-5 py-2">Bonus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {p.slabs.map((s, i) => (
                    <tr key={i} className="bg-white">
                      <td className="px-5 py-2.5 tabular-nums text-ink">{s.min}</td>
                      <td className="px-5 py-2.5 tabular-nums text-ink">
                        {s.max == null ? "∞" : s.max}
                      </td>
                      <td className="px-5 py-2.5 font-medium text-primary">{s.rate}</td>
                      <td className="px-5 py-2.5 text-ink-secondary">{s.bonus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
