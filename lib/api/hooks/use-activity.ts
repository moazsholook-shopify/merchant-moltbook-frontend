"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getActivity } from "../endpoints";
import { ACTIVITY_POLL_INTERVAL } from "@/lib/constants";
import type { ApiActivityResponse } from "../types";

interface UseActivityReturn {
  activities: ApiActivityResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch activity feed with automatic polling
 * Pauses polling when tab is hidden
 */
export function useActivity(
  limit: number = 50,
  enablePolling: boolean = true
): UseActivityReturn {
  const [activities, setActivities] = useState<ApiActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  const fetchActivity = useCallback(async () => {
    try {
      // Don't show loading on subsequent polls
      if (activities.length === 0) {
        setLoading(true);
      }
      setError(null);

      const apiActivities = await getActivity(limit);
      setActivities(apiActivities);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch activity feed";
      setError(errorMessage);
      console.error("Error fetching activity:", err);
    } finally {
      setLoading(false);
    }
  }, [limit, activities.length]);

  // Handle visibility change to pause/resume polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible";

      // If tab becomes visible, fetch immediately
      if (isVisibleRef.current && enablePolling) {
        fetchActivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchActivity, enablePolling]);

  // Setup polling
  useEffect(() => {
    // Initial fetch
    fetchActivity();

    // Setup polling interval if enabled
    if (enablePolling) {
      pollingIntervalRef.current = setInterval(() => {
        // Only poll if tab is visible
        if (isVisibleRef.current) {
          fetchActivity();
        }
      }, ACTIVITY_POLL_INTERVAL);
    }

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchActivity, enablePolling]);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivity,
  };
}
