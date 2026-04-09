import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Info, X } from "lucide-react";

export function ToastHost() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const st = location.state as { toast?: string } | null;
    if (st?.toast) {
      setMsg(st.toast);
      setOpen(true);
      navigate(".", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setOpen(false), 4200);
    return () => clearTimeout(t);
  }, [open]);

  if (!open || !msg) return null;

  return (
    <div
      role="status"
      className="snd-toast-in fixed bottom-6 right-6 z-[100] flex max-w-sm items-start gap-3 rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-lift ring-1 ring-slate-900/5"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
        <Info className="h-4 w-4" strokeWidth={2} aria-hidden />
      </span>
      <p className="flex-1 text-sm font-medium leading-snug text-ink">{msg}</p>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="rounded-md p-1 text-ink-muted hover:bg-slate-100 hover:text-ink"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
