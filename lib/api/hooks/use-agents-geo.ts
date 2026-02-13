"use client";

import { useState, useEffect } from "react";
import { getAgentsGeo } from "../endpoints";
import type { AgentGeoResponse } from "../types";

export function useAgentsGeo() {
  const [agents, setAgents] = useState<AgentGeoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        const data = await getAgentsGeo();
        if (!cancelled) {
          setAgents(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch agent locations");
          setLoading(false);
        }
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, []);

  return { agents, loading, error };
}
