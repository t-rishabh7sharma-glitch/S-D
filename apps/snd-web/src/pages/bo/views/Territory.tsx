import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Plus, Route, Save, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useBoQuery } from "@/hooks/useBoQuery";
import { useSession } from "@/context/SessionContext";
import { apiFetch, getApiBase } from "@/lib/api";
import { fallbackTerritory } from "@/data/boFallback";

type Beat = (typeof fallbackTerritory.beats)[number];
type Res = typeof fallbackTerritory;

export function BoTerritory() {
  const { session } = useSession();
  const isAdmin = session?.roleKey === "ADMIN";
  const api = Boolean(getApiBase());
  const { data, loading, fromApi, refetch } = useBoQuery<Res>("/api/bo/territory", fallbackTerritory);

  const snap = useMemo(() => JSON.stringify(data), [data]);
  const [path, setPath] = useState(data.summary.path);
  const [beatsNote, setBeatsNote] = useState(data.summary.beatsNote);
  const [beats, setBeats] = useState<Beat[]>(() => data.beats.map((b) => ({ ...b })));

  useEffect(() => {
    setPath(data.summary.path);
    setBeatsNote(data.summary.beatsNote);
    setBeats(data.beats.map((b) => ({ ...b })));
  }, [snap]);

  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const showFlash = useCallback((kind: "ok" | "err", text: string) => {
    setFlash({ kind, text });
    window.setTimeout(() => setFlash(null), 4000);
  }, []);

  const save = async () => {
    if (!api) {
      showFlash("err", "Connect the API to save territory.");
      return;
    }
    setBusy(true);
    const r = await apiFetch<Res>("/api/bo/territory", {
      method: "PATCH",
      json: {
        summary: { path, beatsNote },
        beats,
      },
    });
    setBusy(false);
    if (r.ok) {
      showFlash("ok", "Territory saved.");
      await refetch();
    } else showFlash("err", r.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Territory</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Roll-up path, beat assignments, and outlet linkage (demo).
          </p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            disabled={busy || !api}
            onClick={() => void save()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-navy disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save territory
          </button>
        ) : null}
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
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Route className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-ink">Coverage path</h2>
            {isAdmin ? (
              <textarea
                value={path}
                onChange={(e) => setPath(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-ink-secondary"
              />
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{data.summary.path}</p>
            )}
            {isAdmin ? (
              <textarea
                value={beatsNote}
                onChange={(e) => setBeatsNote(e.target.value)}
                rows={2}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-ink-muted"
              />
            ) : (
              <p className="mt-2 text-xs text-ink-muted">{data.summary.beatsNote}</p>
            )}
          </div>
        </Card>
        <Card className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy/10 text-navy">
            <MapPin className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">Beats</h2>
            <p className="mt-2 text-xs text-ink-muted">
              {fromApi ? "Synced from API." : "Local snapshot (start API for live)."}
            </p>
          </div>
        </Card>
      </div>
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Beat roster</span>
          {isAdmin ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setBeats((b) => [...b, { user: "", beat: "", active: true }])}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
              Add row
            </button>
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Beat code</th>
                <th className="px-4 py-3">Status</th>
                {isAdmin ? <th className="px-4 py-3 text-right"> </th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {beats.map((b, i) => (
                <tr key={`${b.beat}-${i}`} className="bg-white hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <input
                        value={b.user}
                        onChange={(e) => {
                          const v = e.target.value;
                          setBeats((prev) => prev.map((x, j) => (j === i ? { ...x, user: v } : x)));
                        }}
                        className="w-full min-w-[140px] rounded-lg border border-slate-200 px-2 py-1.5 font-medium text-ink"
                      />
                    ) : (
                      <span className="font-medium text-ink">{b.user}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <input
                        value={b.beat}
                        onChange={(e) => {
                          const v = e.target.value;
                          setBeats((prev) => prev.map((x, j) => (j === i ? { ...x, beat: v } : x)));
                        }}
                        className="w-full min-w-[100px] rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs text-ink-secondary"
                      />
                    ) : (
                      <span className="font-mono text-xs text-ink-secondary">{b.beat}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-ink-secondary">
                        <input
                          type="checkbox"
                          checked={b.active}
                          onChange={(e) => {
                            const v = e.target.checked;
                            setBeats((prev) => prev.map((x, j) => (j === i ? { ...x, active: v } : x)));
                          }}
                        />
                        Active
                      </label>
                    ) : (
                      <span
                        className={`text-xs font-bold ${b.active ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        {b.active ? "Active" : "Released"}
                      </span>
                    )}
                  </td>
                  {isAdmin ? (
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setBeats((prev) => prev.filter((_, j) => j !== i))}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        aria-label="Remove beat row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
