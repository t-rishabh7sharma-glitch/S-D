import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { defaultPath } from "@/lib/session";
import { Button } from "@/components/ui/Button";

export function LoginPage() {
  const { session, ready, signIn } = useSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready || !session) return;
    const path =
      next && next.startsWith("/") && !next.startsWith("//") ? next : defaultPath(session.workspace);
    navigate(path, { replace: true });
  }, [ready, session, next, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const r = await signIn(id, pw);
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      const path =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : defaultPath(r.session.workspace);
      navigate(path, { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div
        className="h-1.5 shrink-0 bg-gradient-to-r from-primary via-navy to-navy-deep lg:hidden"
        aria-hidden
      />
      <div className="relative hidden w-[46%] min-w-[320px] flex-col justify-between overflow-hidden bg-gradient-to-br from-navy via-[#002a66] to-[#001a4a] p-10 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(0,186,242,0.18),transparent)]" />
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
            Enterprise S&amp;D
          </div>
          <h1 className="max-w-md text-4xl font-bold leading-[1.1] tracking-tight">
            One platform for field execution and commercial control.
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/65">
            Hierarchies, territories, targets, incentives, and analytics — with strict role boundaries.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/40">
          UI prototype · design tokens #00BAF2 / #002970
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center bg-surface px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[400px] snd-fade-in">
          <div className="mb-8 lg:hidden">
            <h1 className="text-2xl font-bold tracking-tight text-ink">Sign in</h1>
            <p className="mt-1 text-sm text-ink-muted">Sales &amp; Distribution control plane</p>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-2xl font-bold tracking-tight text-ink">Sign in</h2>
            <p className="mt-1 text-sm text-ink-muted">Use your employee ID (demo password: any)</p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            {err ? (
              <div
                id="login-error"
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800"
              >
                {err}
              </div>
            ) : null}
            <div>
              <label htmlFor="eid" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy">
                Employee ID
              </label>
              <input
                id="eid"
                value={id}
                onChange={(e) => setId(e.target.value)}
                autoCapitalize="characters"
                autoComplete="username"
                aria-invalid={Boolean(err)}
                aria-describedby={err ? "login-error" : undefined}
                className={`w-full rounded-xl border bg-white px-3.5 py-3 text-[15px] text-ink shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-primary/15 ${
                  err ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-primary"
                }`}
                placeholder="ADMIN-101"
              />
            </div>
            <div>
              <label htmlFor="pw" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy">
                Password
              </label>
              <input
                id="pw"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[15px] text-ink shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-xl text-[15px] shadow-md shadow-primary/15 transition active:scale-[0.99]"
            >
              {busy ? "Signing in…" : "Continue"}
            </Button>
          </form>

          <details className="mt-10 rounded-xl border border-slate-200/80 bg-white p-4 shadow-card">
            <summary className="cursor-pointer text-sm font-semibold text-ink">
              Demo accounts
            </summary>
            <div className="mt-3 space-y-2 text-xs leading-relaxed text-ink-muted">
              <p>
                <span className="font-semibold text-ink">Back office:</span> ADMIN-101 · TDR-101 · ZBM-101
              </p>
              <p>
                <span className="font-semibold text-ink">Field:</span> DSA-101 · AGENT-101
              </p>
              <p className="text-[11px]">
                Password is not validated in MVP. With dev defaults, BO/field data syncs when{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px] text-navy">snd-api</code> is
                running on port 4000.
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
