import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { apiFetch, getApiBase } from "@/lib/api";
import { useFieldVisits } from "@/hooks/useFieldVisits";

const OUTLETS = [
  { id: "o1", title: "Metro Mart — CBD", sub: "LSK-CBD-01 · High footfall" },
  { id: "o2", title: "QuickShop — Eastgate", sub: "LSK-EG-04 · MoMo hotspot" },
  { id: "o3", title: "City Express — Roma", sub: "LSK-RM-02 · Float watch" },
];

const STEPS = ["Outlet", "Checklist", "Notes"] as const;

export function FieldVisit() {
  const navigate = useNavigate();
  const { refetch } = useFieldVisits();
  const [step, setStep] = useState(0);
  const [outletId, setOutletId] = useState<string | null>(null);
  const [checks, setChecks] = useState({ stock: false, float: false, branding: false });
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ synced: boolean } | null>(null);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const outlet = OUTLETS.find((o) => o.id === outletId);

  function goNext() {
    setFlowError(null);
    if (step === 0 && !outletId) {
      setFlowError("Select an outlet to continue.");
      return;
    }
    if (step === 1) {
      const n = Object.values(checks).filter(Boolean).length;
      if (n < 1) {
        setFlowError("Confirm at least one checklist item (tap to mark done).");
        return;
      }
    }
    setStep((s) => s + 1);
  }

  async function submit() {
    const title = outlet?.title ?? "Outlet";
    setSubmitError(null);
    setBusy(true);
    const checklist = `Stock:${checks.stock ? "OK" : "—"} Float:${checks.float ? "OK" : "—"} Brand:${checks.branding ? "OK" : "—"}`;
    const body = `${checklist}\n${notes}`.trim();
    const api = getApiBase();
    if (api) {
      const r = await apiFetch<{ visit: { id: string } }>("/api/field/visits", {
        method: "POST",
        json: { outlet: title, notes: body },
      });
      setBusy(false);
      if (r.ok) {
        void refetch();
        setDone({ synced: true });
        return;
      }
      setSubmitError(r.error || "Could not sync. Check HQ connection and try again.");
      return;
    }
    setBusy(false);
    setDone({ synced: false });
  }

  if (done) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="snd-fade-in flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-400/30">
          <CheckCircle2 className="h-14 w-14 text-emerald-400" strokeWidth={1.75} />
        </div>
        <h1 className="mt-8 text-center text-2xl font-bold tracking-tight">Visit logged</h1>
        <p className="mt-2 max-w-xs text-center text-sm text-white/50">
          {done.synced
            ? "Synced to HQ — your supervisor can see it in back office."
            : "Saved on this device only. Start the API to persist visits."}
        </p>
        <div className="mt-10 w-full max-w-sm space-y-3">
          <button
            type="button"
            onClick={() => {
              setDone(null);
              setStep(0);
              setOutletId(null);
              setChecks({ stock: false, float: false, branding: false });
              setNotes("");
              setFlowError(null);
              setSubmitError(null);
            }}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-[15px] font-bold text-navy shadow-lg shadow-primary/30 transition active:scale-[0.99]"
          >
            Log another visit
          </button>
          <Link
            to="/field"
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/[0.14]"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col pb-40">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/5 bg-[#0a0d12]/90 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <Link
          to="/field"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white ring-1 ring-white/10 transition hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">New visit</p>
          <h1 className="text-lg font-bold">{STEPS[step]}</h1>
        </div>
      </header>

      <div className="mx-4 mt-5 flex items-center justify-center gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === step ? "w-8 bg-primary" : i < step ? "w-2.5 bg-emerald-400" : "w-2.5 bg-white/15"
            }`}
          />
        ))}
      </div>

      {flowError ? (
        <div
          className="snd-shake mx-4 mt-4 rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-semibold leading-snug text-rose-100 ring-1 ring-rose-400/35"
          role="alert"
        >
          {flowError}
        </div>
      ) : null}

      <main className="mx-4 mt-6 flex-1 space-y-4">
        {step === 0 ? (
          <>
            <p className="text-sm text-white/45">Pick where you are — large cards for gloves / sun glare.</p>
            <div className="space-y-3">
              {OUTLETS.map((o) => {
                const sel = outletId === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setOutletId(o.id);
                      setFlowError(null);
                    }}
                    className={`w-full rounded-3xl p-5 text-left ring-2 transition-all duration-200 active:scale-[0.99] ${
                      sel
                        ? "bg-primary/15 ring-primary shadow-lg shadow-primary/10"
                        : "bg-white/[0.06] ring-white/10 hover:bg-white/[0.09]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                          sel ? "bg-primary text-navy" : "bg-white/10 text-white/40"
                        }`}
                      >
                        {sel ? <Check className="h-5 w-5" strokeWidth={3} /> : <Circle className="h-5 w-5" />}
                      </span>
                      <div>
                        <p className="text-lg font-bold leading-snug">{o.title}</p>
                        <p className="mt-1 text-sm text-white/45">{o.sub}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <p className="text-sm text-white/45">Quick taps — like completing delivery steps.</p>
            {(
              [
                ["stock", "SIM & starter pack stock looks adequate"],
                ["float", "Outlet float above minimum"],
                ["branding", "Branding / POSM in place"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setChecks((c) => ({ ...c, [key]: !c[key] }));
                  setFlowError(null);
                }}
                className={`flex w-full items-center gap-4 rounded-3xl px-5 py-4 text-left ring-2 transition-all duration-200 active:scale-[0.99] ${
                  checks[key]
                    ? "bg-emerald-500/15 ring-emerald-400/50"
                    : "bg-white/[0.06] ring-white/10"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    checks[key] ? "bg-emerald-500 text-white" : "bg-white/10 text-white/35"
                  }`}
                >
                  {checks[key] ? <Check className="h-6 w-6" strokeWidth={3} /> : null}
                </span>
                <span className="text-base font-semibold leading-snug">{label}</span>
              </button>
            ))}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <p className="text-sm text-white/45">Anything the BO should know? Optional but helpful for audits.</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              placeholder="Float issue, competitor promo, stock-out SKU…"
              className="w-full resize-none rounded-3xl border-0 bg-white/[0.07] px-5 py-4 text-base text-white placeholder:text-white/30 ring-2 ring-white/10 transition focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </>
        ) : null}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-[#0a0d12] via-[#0a0d12]/98 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
        {submitError ? (
          <div
            className="mb-3 rounded-2xl bg-rose-500/15 px-4 py-3 text-center text-xs font-semibold text-rose-100 ring-1 ring-rose-400/35"
            role="alert"
          >
            {submitError}
          </div>
        ) : null}
        {step < 2 ? (
          <button
            type="button"
            disabled={busy}
            onClick={goNext}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-[15px] font-bold text-navy shadow-lg shadow-primary/35 transition active:scale-[0.99] disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-[15px] font-bold text-navy shadow-lg shadow-primary/35 transition active:scale-[0.99] disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit visit"}
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate("/field")}
          className="mt-2 w-full py-2 text-center text-sm font-semibold text-white/40 transition hover:text-white/55"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
