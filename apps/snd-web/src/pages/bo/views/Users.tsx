import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useBoQuery } from "@/hooks/useBoQuery";
import { useSession } from "@/context/SessionContext";
import { apiFetch, getApiBase } from "@/lib/api";
import { fallbackDirectory } from "@/data/boFallback";
import type { DirectoryUser } from "@/types/api";

type Res = { users: DirectoryUser[] };

const fb: Res = { users: [...fallbackDirectory] };

function newUserForm(): Omit<DirectoryUser, "id"> {
  return {
    name: "",
    email: "",
    role: "DSA",
    path: "",
    code: "",
    kyc: "PENDING",
    distributor: "",
    beat: "",
  };
}

export function BoUsers() {
  const { session } = useSession();
  const isAdmin = session?.roleKey === "ADMIN";
  const api = Boolean(getApiBase());
  const { data, loading, refetch } = useBoQuery<Res>("/api/bo/users", fb);

  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"idle" | "add" | "edit">("idle");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<DirectoryUser, "id">>(newUserForm);

  const showFlash = useCallback((kind: "ok" | "err", text: string) => {
    setFlash({ kind, text });
    window.setTimeout(() => setFlash(null), 4000);
  }, []);

  useEffect(() => {
    if (mode === "edit" && editId) {
      const u = data.users.find((x) => x.id === editId);
      if (u) {
        setForm({
          name: u.name,
          email: u.email,
          role: u.role,
          path: u.path,
          code: u.code,
          kyc: u.kyc,
          distributor: u.distributor,
          beat: u.beat,
        });
      }
    }
    if (mode === "add") setForm(newUserForm());
  }, [mode, editId, data.users]);

  const closeForm = () => {
    setMode("idle");
    setEditId(null);
  };

  const save = async () => {
    if (!api) {
      showFlash("err", "Connect the API to save users.");
      return;
    }
    setBusy(true);
    if (mode === "add") {
      const r = await apiFetch<Res>("/api/bo/users", { method: "POST", json: form });
      setBusy(false);
      if (r.ok) {
        showFlash("ok", "User added.");
        closeForm();
        await refetch();
      } else showFlash("err", r.error);
      return;
    }
    if (mode === "edit" && editId) {
      const r = await apiFetch<Res>(`/api/bo/users/${encodeURIComponent(editId)}`, {
        method: "PATCH",
        json: form,
      });
      setBusy(false);
      if (r.ok) {
        showFlash("ok", "User updated.");
        closeForm();
        await refetch();
      } else showFlash("err", r.error);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Remove this directory row?")) return;
    if (!api) {
      showFlash("err", "Connect the API to delete users.");
      return;
    }
    setBusy(true);
    const r = await apiFetch<Res>(`/api/bo/users/${encodeURIComponent(id)}`, { method: "DELETE" });
    setBusy(false);
    if (r.ok) {
      showFlash("ok", "Removed.");
      closeForm();
      await refetch();
    } else showFlash("err", r.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Users &amp; agents</h1>
          <p className="mt-1 text-sm text-ink-muted">Directory with hierarchy path, codes, and KYC.</p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            disabled={!api || busy}
            onClick={() => {
              setEditId(null);
              setForm(newUserForm());
              setMode("add");
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-navy disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add user
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

      {isAdmin && mode !== "idle" ? (
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">{mode === "add" ? "New user" : "Edit user"}</h2>
            <button type="button" onClick={closeForm} className="rounded-lg p-2 text-ink-muted hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["name", "Name"],
                ["email", "Email"],
                ["role", "Role"],
                ["path", "Path"],
                ["code", "Code"],
                ["kyc", "KYC"],
                ["distributor", "Distributor"],
                ["beat", "Beat"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-xs font-semibold text-ink-secondary">
                {label}
                <input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !form.name.trim()}
              onClick={() => void save()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-navy disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            {mode === "edit" && editId ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void remove(editId)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-800"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            ) : null}
          </div>
        </Card>
      ) : null}

      {loading ? <p className="text-sm text-ink-muted">Loading…</p> : null}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">KYC</th>
                <th className="px-4 py-3">Path</th>
                {isAdmin ? <th className="px-4 py-3 text-right">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.users.map((u) => (
                <tr key={u.id} className="bg-white hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{u.name}</div>
                    <div className="text-xs text-ink-muted">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-ink-secondary">{u.role}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-secondary">{u.code}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.kyc === "VERIFIED"
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-amber-50 text-amber-900"
                      }`}
                    >
                      {u.kyc}
                    </span>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-ink-muted" title={u.path}>
                    {u.path}
                  </td>
                  {isAdmin ? (
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setEditId(u.id);
                          setMode("edit");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-ink hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
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
