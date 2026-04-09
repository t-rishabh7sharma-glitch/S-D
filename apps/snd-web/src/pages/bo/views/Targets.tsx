import { useCallback, useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useBoQuery } from "@/hooks/useBoQuery";
import { useSession } from "@/context/SessionContext";
import { apiFetch, getApiBase } from "@/lib/api";
import { fallbackTargetCampaign } from "@/data/boFallback";

type Campaign = typeof fallbackTargetCampaign;
type Res = { campaign: Campaign };
type Row = Campaign["rows"][number];

const fb: Res = { campaign: fallbackTargetCampaign };

export function BoTargets() {
  const { session } = useSession();
  const isAdmin = session?.roleKey === "ADMIN";
  const api = Boolean(getApiBase());
  const { data, loading, refetch } = useBoQuery<Res>("/api/bo/targets/current", fb);
  const c = data.campaign;

  const rowsSig = useMemo(() => JSON.stringify(c.rows), [c.rows]);
  const [rows, setRows] = useState<Row[]>(() => c.rows.map((r) => ({ ...r })));
  const [name, setName] = useState(c.name);
  const [method, setMethod] = useState(c.method);
  const [status, setStatus] = useState(c.status);

  useEffect(() => {
    setRows(c.rows.map((r) => ({ ...r })));
  }, [rowsSig]);

  useEffect(() => {
    setName(c.name);
    setMethod(c.method);
    setStatus(c.status);
  }, [c.name, c.method, c.status]);

  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const showFlash = useCallback((kind: "ok" | "err", text: string) => {
    setFlash({ kind, text });
    window.setTimeout(() => setFlash(null), 4000);
  }, []);

  const save = async () => {
    if (!api) {
      showFlash("err", "Connect the API to save targets.");
      return;
    }
    setBusy(true);
    const r = await apiFetch<Res>("/api/bo/targets/current", {
      method: "PATCH",
      json: {
        name,
        method,
        status,
        rows: rows.map((row) => ({
          node: row.node,
          amount: Number(row.amount) || 0,
          pct: typeof row.pct === "number" ? row.pct : Number(row.pct) || 0,
        })),
      },
    });
    setBusy(false);
    if (r.ok) {
      showFlash("ok", "Campaign saved.");
      await refetch();
    } else showFlash("err", r.error);
  };

  const total = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Targets</h1>
        <p className="mt-1 text-sm text-ink-muted">Campaign roll-down and draft allocations.</p>
      </div>

      {flash ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            flash.kind === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {flash.text}
        </div>
      ) : null}

      {loading ? <p className="text-sm text-ink-muted">Loading…</p> : null}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-[200px] flex-1 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Campaign</div>
            {isAdmin ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-lg font-bold text-ink"
              />
            ) : (
              <h2 className="mt-1 text-xl font-bold text-ink">{c.name}</h2>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin ? (
              <>
                <input
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-ink-secondary"
                />
                <input
                  value={status}
                  onChange={(e) => setStatus(e.target.value.toUpperCase())}
                  className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900"
                />
              </>
            ) : (
              <>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink-secondary">
                  {c.method}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                  {c.status}
                </span>
              </>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          Total (from rows):{" "}
          <span className="font-semibold text-ink">{total.toLocaleString("en-US")}</span>
          {isAdmin ? (
            <span className="ml-2 text-xs">Saved total is recalculated on the server when you save.</span>
          ) : null}
        </p>
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              <tr>
                <th className="px-4 py-3">Node</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r, i) => (
                <tr key={`${r.node}-${i}`} className="bg-white">
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <input
                        value={r.node}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRows((prev) => prev.map((x, j) => (j === i ? { ...x, node: v } : x)));
                        }}
                        className="w-full min-w-[120px] rounded-lg border border-slate-200 px-2 py-1.5 font-medium text-ink"
                      />
                    ) : (
                      <span className="font-medium text-ink">{r.node}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">
                    {isAdmin ? (
                      <input
                        type="number"
                        value={r.amount}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setRows((prev) => prev.map((x, j) => (j === i ? { ...x, amount: v } : x)));
                        }}
                        className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm tabular-nums text-ink"
                      />
                    ) : (
                      r.amount.toLocaleString("en-US")
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-secondary">
                    {isAdmin ? (
                      <input
                        type="number"
                        step="0.1"
                        value={r.pct}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setRows((prev) => prev.map((x, j) => (j === i ? { ...x, pct: v } : x)));
                        }}
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm tabular-nums text-ink"
                      />
                    ) : (
                      r.pct
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isAdmin ? (
          <div className="mt-4">
            <button
              type="button"
              disabled={busy || !api}
              onClick={() => void save()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-navy disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save campaign
            </button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
