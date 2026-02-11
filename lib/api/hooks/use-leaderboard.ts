"use client";

import { useState, useEffect, useCallback } from "react";
import { getLeaderboard } from "../endpoints";
import type { ApiLeaderboardEntryResponse } from "../types";

interface UseLeaderboardReturn {
  leaderboard: ApiLeaderboardEntryResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch trust leaderboard
 */
export function useLeaderboard(): UseLeaderboardReturn {
  const [leaderboard, setLeaderboard] = useState<ApiLeaderboardEntryResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch leaderboard";
      setError(errorMessage);
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard,
  };
}
