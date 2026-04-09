import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, getApiBase } from "@/lib/api";
import { useSession } from "@/context/SessionContext";

/**
 * Loads BO JSON from API when available; otherwise keeps `fallback`.
 * Re-fetches when `path` or session changes.
 */
export function useBoQuery<T>(path: string, fallback: T) {
  const { session, ready } = useSession();
  const fb = useRef(fallback);
  fb.current = fallback;
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [fromApi, setFromApi] = useState(false);
  const [initialDone, setInitialDone] = useState(false);

  const refetch = useCallback(async () => {
    const base = getApiBase();
    if (!base || session?.workspace !== "bo") {
      setData(fb.current);
      setFromApi(false);
      setLoading(false);
      setInitialDone(true);
      return;
    }
    setLoading(true);
    const r = await apiFetch<T>(path, { method: "GET" });
    if (r.ok) {
      setData(r.data);
      setFromApi(true);
    } else {
      setData(fb.current);
      setFromApi(false);
    }
    setLoading(false);
    setInitialDone(true);
  }, [path, session?.workspace]);

  useEffect(() => {
    if (!ready) return;
    let cancel = false;
    (async () => {
      if (!getApiBase() || session?.workspace !== "bo") {
        if (!cancel) {
          setData(fb.current);
          setFromApi(false);
          setLoading(false);
          setInitialDone(true);
        }
        return;
      }
      if (!cancel) setLoading(true);
      const r = await apiFetch<T>(path, { method: "GET" });
      if (cancel) return;
      if (r.ok) {
        setData(r.data);
        setFromApi(true);
      } else {
        setData(fb.current);
        setFromApi(false);
      }
      setLoading(false);
      if (!cancel) setInitialDone(true);
    })();
    return () => {
      cancel = true;
    };
  }, [ready, path, session?.workspace, session?.userId]);

  return { data, loading, fromApi, refetch, initialDone };
}
