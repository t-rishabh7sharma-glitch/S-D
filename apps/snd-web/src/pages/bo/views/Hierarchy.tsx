import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { OrgTree, findOrgNode } from "@/components/bo/OrgTree";
import { useBoQuery } from "@/hooks/useBoQuery";
import { useSession } from "@/context/SessionContext";
import { apiFetch, getApiBase } from "@/lib/api";
import { fallbackOrgTree } from "@/data/boFallback";
import type { OrgNode } from "@/types/api";

type Res = { tree: OrgNode };

const LEVELS = ["CSDO", "HSD", "ZBM", "ASE", "TDR", "TL", "DSA", "SBM"] as const;

export function BoHierarchy() {
  const { session } = useSession();
  const isAdmin = session?.roleKey === "ADMIN";
  const api = Boolean(getApiBase());
  const { data, loading, fromApi, refetch } = useBoQuery<Res>("/api/bo/org-tree", { tree: fallbackOrgTree });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addName, setAddName] = useState("");
  const [addLevel, setAddLevel] = useState<string>("DSA");
  const [renameName, setRenameName] = useState("");
  const [renameLevel, setRenameLevel] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!loading && selectedId === null && data.tree?.id) setSelectedId(data.tree.id);
  }, [loading, data.tree, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const n = findOrgNode(data.tree, selectedId);
    if (n) {
      setRenameName(n.name);
      setRenameLevel(n.level);
    }
  }, [selectedId, data.tree]);

  const showFlash = useCallback((kind: "ok" | "err", text: string) => {
    setFlash({ kind, text });
    window.setTimeout(() => setFlash(null), 4000);
  }, []);

  const run = useCallback(
    async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
      if (!api) {
        showFlash("err", "Connect the API to save hierarchy changes.");
        return;
      }
      if (!isAdmin) return;
      setBusy(true);
      const r = await fn();
      setBusy(false);
      if (r.ok) {
        showFlash("ok", "Saved.");
        await refetch();
      } else showFlash("err", r.error || "Request failed");
    },
    [api, isAdmin, refetch, showFlash],
  );

  const parentId = selectedId || data.tree.id;
  const selectedNode = selectedId ? findOrgNode(data.tree, selectedId) : null;
  const isRoot = selectedId === data.tree.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Hierarchy</h1>
          <p className="mt-1 text-sm text-ink-muted">
            CSDO → HSD → ZBM → ASE → TDR → TL → DSA. Expand nodes to drill down.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-ink-muted">
          {loading ? <span>Loading…</span> : null}
          {fromApi ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800">
              Live data
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-ink-secondary">
              Offline snapshot
            </span>
          )}
        </div>
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

      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <span
            key={l}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-ink-secondary"
          >
            {l}
          </span>
        ))}
      </div>

      {isAdmin ? (
        <Card className="p-4">
          <h2 className="text-sm font-bold text-ink">Edit organisation tree</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Select a node in the tree, then add children, rename, reorder among siblings, or delete leaf nodes.
            {!api ? " API URL required (e.g. VITE_API_BASE) for writes." : null}
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-ink-secondary">Add child</div>
              <p className="text-[11px] text-ink-muted">Parent: {selectedNode?.name ?? data.tree.name}</p>
              <input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Name"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink"
              />
              <select
                value={addLevel}
                onChange={(e) => setAddLevel(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={busy || !api}
                onClick={() =>
                  run(async () => {
                    const r = await apiFetch<Res>("/api/bo/org-tree/node", {
                      method: "POST",
                      json: { parentId, name: addName, level: addLevel },
                    });
                    if (r.ok) {
                      setAddName("");
                      return { ok: true };
                    }
                    return { ok: false, error: r.error };
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-navy disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add child
              </button>
            </div>
            <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-ink-secondary">Rename selected</div>
              <input
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink"
              />
              <select
                value={renameLevel}
                onChange={(e) => setRenameLevel(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={busy || !api || !selectedId}
                onClick={() =>
                  run(async () => {
                    const r = await apiFetch<Res>(`/api/bo/org-tree/node/${encodeURIComponent(selectedId!)}`, {
                      method: "PATCH",
                      json: { name: renameName, level: renameLevel },
                    });
                    return r.ok ? { ok: true } : { ok: false, error: r.error };
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-ink hover:bg-slate-50 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Save name / level
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !api || !selectedId || isRoot}
              onClick={() =>
                run(async () => {
                  const r = await apiFetch<Res>(
                    `/api/bo/org-tree/node/${encodeURIComponent(selectedId!)}/move-up`,
                    { method: "POST" },
                  );
                  return r.ok ? { ok: true } : { ok: false, error: r.error };
                })
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-ink disabled:opacity-50"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              Move up
            </button>
            <button
              type="button"
              disabled={busy || !api || !selectedId || isRoot}
              onClick={() =>
                run(async () => {
                  const r = await apiFetch<Res>(
                    `/api/bo/org-tree/node/${encodeURIComponent(selectedId!)}/move-down`,
                    { method: "POST" },
                  );
                  return r.ok ? { ok: true } : { ok: false, error: r.error };
                })
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-ink disabled:opacity-50"
            >
              <ArrowDown className="h-3.5 w-3.5" />
              Move down
            </button>
            <button
              type="button"
              disabled={busy || !api || !selectedId || isRoot}
              onClick={() => {
                if (!window.confirm("Delete this node? It must have no children.")) return;
                void run(async () => {
                  const r = await apiFetch<Res>(`/api/bo/org-tree/node/${encodeURIComponent(selectedId!)}`, {
                    method: "DELETE",
                  });
                  if (r.ok) {
                    setSelectedId(data.tree.id);
                    return { ok: true };
                  }
                  return { ok: false, error: r.error };
                });
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete leaf
            </button>
          </div>
        </Card>
      ) : (
        <p className="text-sm text-ink-muted">Sign in as an administrator to edit the hierarchy.</p>
      )}

      <Card className="p-0">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-bold text-ink">Organisation tree</h2>
          <p className="text-xs text-ink-muted">
            {isAdmin ? "Click the chevron to expand; click the name strip to select a node." : "View-only for your role."}
          </p>
        </div>
        <div className="p-4">
          <OrgTree
            root={data.tree}
            editable={isAdmin}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </Card>
    </div>
  );
}
