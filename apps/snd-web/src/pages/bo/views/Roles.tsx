import { Card } from "@/components/ui/Card";
import { useBoQuery } from "@/hooks/useBoQuery";
import { fallbackRbac } from "@/data/boFallback";

type Row = (typeof fallbackRbac)[number];
type Res = { rows: Row[] };

const fb: Res = { rows: [...fallbackRbac] };

export function BoRoles() {
  const { data, loading } = useBoQuery<Res>("/api/bo/rbac", fb);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Roles &amp; RBAC</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Policy matrix — aligns with sidebar visibility in this MVP.
        </p>
      </div>
      {loading ? <p className="text-sm text-ink-muted">Loading…</p> : null}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              <tr>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Modules</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.rows.map((r) => (
                <tr key={r.role} className="bg-white hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-semibold text-ink">{r.role}</td>
                  <td className="max-w-[280px] px-4 py-3 text-ink-secondary">{r.modules}</td>
                  <td className="px-4 py-3 text-ink-secondary">{r.scope}</td>
                  <td className="px-4 py-3 text-ink-secondary">{r.rw}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
