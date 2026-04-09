import { useCallback, useEffect, useState } from "react";
import { apiFetch, getApiBase } from "@/lib/api";
import { useSession } from "@/context/SessionContext";
import type { VisitRow } from "@/types/api";

type Res = { visits: VisitRow[] };

export function useFieldVisits() {
  const { session, ready } = useSession();
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!getApiBase() || session?.workspace !== "agent") {
      setVisits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const r = await apiFetch<Res>("/api/field/visits", { method: "GET" });
    if (r.ok) setVisits(r.data.visits);
    else setVisits([]);
    setLoading(false);
  }, [session?.workspace]);

  useEffect(() => {
    if (!ready) return;
    void refetch();
  }, [ready, refetch, session?.userId]);

  return { visits, loading, refetch };
}
