import { useCallback, useEffect, useState } from "react";
import { api, type Match } from "../api/client";

export function useMatches(params: Record<string, string | undefined> = {}, intervalMs = 15000) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const paramsKey = JSON.stringify(params);

  const load = useCallback(async () => {
    try {
      const res = await api.listMatches(JSON.parse(paramsKey));
      setMatches(res.data);
      setTotal(res.total);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    load();
    const t = setInterval(load, intervalMs);
    return () => clearInterval(t);
  }, [load, intervalMs]);

  return { matches, total, error, loading, reload: load };
}
