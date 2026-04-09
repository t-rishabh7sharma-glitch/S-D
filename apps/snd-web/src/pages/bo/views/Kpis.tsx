import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useBoQuery } from "@/hooks/useBoQuery";
import { useSession } from "@/context/SessionContext";
import { apiFetch, getApiBase } from "@/lib/api";
import { fallbackKpis } from "@/data/boFallback";

type Kpi = (typeof fallbackKpis)[number];
type Res = { kpis: Kpi[] };

const fb: Res = { kpis: [...fallbackKpis] };

export function BoKpis() {
  const { session } = useSession();
  const isAdmin = session?.roleKey === "ADMIN";
  const api = Boolean(getApiBase());
  const { data, loading, refetch } = useBoQuery<Res>("/api/bo/kpis", fb);

  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [newKpi, setNewKpi] = useState<Kpi>({
    name: "",
    unit: "count",
    freq: "MONTHLY",
    formula: "",
  });

  const showFlash = useCallback((kind: "ok" | "err", text: string) => {
    setFlash({ kind, text });
    window.setTimeout(() => setFlash(null), 4000);
  }, []);

  const saveRow = async (idx: number, k: Kpi) => {
    if (!api) {
      showFlash("err", "Connect the API to save KPIs.");
      return;
    }
    setBusy(true);
    const r = await apiFetch<Res>(`/api/bo/kpis/${idx}`, { method: "PATCH", json: k });
    setBusy(false);
    if (r.ok) {
      showFlash("ok", "KPI updated.");
      await refetch();
    } else showFlash("err", r.error);
  };

  const deleteRow = async (idx: number) => {
    if (!window.confirm("Remove this KPI definition?")) return;
    if (!api) {
      showFlash("err", "Connect the API to delete KPIs.");
      return;
    }
    setBusy(true);
    const r = await apiFetch<Res>(`/api/bo/kpis/${idx}`, { method: "DELETE" });
    setBusy(false);
    if (r.ok) {
      showFlash("ok", "Removed.");
      await refetch();
    } else showFlash("err", r.error);
  };

  const addKpi = async () => {
    if (!newKpi.name.trim()) {
      showFlash("err", "Name is required.");
      return;
    }
    if (!api) {
      showFlash("err", "Connect the API to add KPIs.");
      return;
    }
    setBusy(true);
    const r = await apiFetch<Res>("/api/bo/kpis", { method: "POST", json: newKpi });
    setBusy(false);
    if (r.ok) {
      showFlash("ok", "KPI added.");
      setNewKpi({ name: "", unit: "count", freq: "MONTHLY", formula: "" });
      await refetch();
    } else showFlash("err", r.error);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">KPI engine</h1>
        <p className="mt-1 text-sm text-ink-muted">Metric definitions used in targets and payouts.</p>
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

      <div className="grid gap-4 md:grid-cols-2">
        {data.kpis.map((k, idx) => (
          <KpiEditorCard
            key={`${k.name}-${idx}`}
            kpi={k}
            idx={idx}
            isAdmin={isAdmin}
            api={api}
            busy={busy}
            onSave={(updated) => void saveRow(idx, updated)}
            onDelete={() => void deleteRow(idx)}
          />
        ))}
      </div>

      {isAdmin ? (
        <Card className="p-4">
          <h2 className="text-sm font-bold text-ink">Add metric</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-ink-secondary">
              Name
              <input
                value={newKpi.name}
                onChange={(e) => setNewKpi((x) => ({ ...x, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="text-xs font-semibold text-ink-secondary">
              Unit
              <input
                value={newKpi.unit}
                onChange={(e) => setNewKpi((x) => ({ ...x, unit: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="text-xs font-semibold text-ink-secondary">
              Frequency
              <input
                value={newKpi.freq}
                onChange={(e) => setNewKpi((x) => ({ ...x, freq: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="text-xs font-semibold text-ink-secondary sm:col-span-2">
              Formula
              <input
                value={newKpi.formula}
                onChange={(e) => setNewKpi((x) => ({ ...x, formula: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-ink"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={busy || !api}
            onClick={() => void addKpi()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-navy disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add KPI
          </button>
        </Card>
      ) : null}
    </div>
  );
}

function KpiEditorCard({
  kpi,
  idx,
  isAdmin,
  api,
  busy,
  onSave,
  onDelete,
}: {
  kpi: Kpi;
  idx: number;
  isAdmin: boolean;
  api: boolean;
  busy: boolean;
  onSave: (k: Kpi) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(kpi);
  const sig = JSON.stringify(kpi);
  useEffect(() => {
    setDraft(JSON.parse(sig) as Kpi);
  }, [sig]);

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary">Metric #{idx + 1}</div>
        {isAdmin ? (
          <button
            type="button"
            disabled={busy || !api}
            onClick={onDelete}
            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
            aria-label="Delete KPI"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {isAdmin ? (
        <input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className="mt-2 w-full border-b border-transparent text-lg font-bold text-ink outline-none focus:border-primary"
        />
      ) : (
        <h2 className="mt-2 text-lg font-bold text-ink">{kpi.name}</h2>
      )}
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Unit</dt>
          <dd className="min-w-0 flex-1 text-right">
            {isAdmin ? (
              <input
                value={draft.unit}
                onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-right font-medium text-ink"
              />
            ) : (
              <span className="font-medium text-ink">{kpi.unit}</span>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Frequency</dt>
          <dd className="min-w-0 flex-1 text-right">
            {isAdmin ? (
              <input
                value={draft.freq}
                onChange={(e) => setDraft((d) => ({ ...d, freq: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-right font-medium text-ink"
              />
            ) : (
              <span className="font-medium text-ink">{kpi.freq}</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Formula</dt>
          <dd className="mt-1">
            {isAdmin ? (
              <textarea
                value={draft.formula}
                onChange={(e) => setDraft((d) => ({ ...d, formula: e.target.value }))}
                rows={2}
                className="w-full rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-ink-secondary"
              />
            ) : (
              <div className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-ink-secondary">
                {kpi.formula}
              </div>
            )}
          </dd>
        </div>
      </dl>
      {isAdmin ? (
        <button
          type="button"
          disabled={busy || !api}
          onClick={() => onSave(draft)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-ink hover:bg-slate-50 disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          Save changes
        </button>
      ) : null}
    </Card>
  );
}
