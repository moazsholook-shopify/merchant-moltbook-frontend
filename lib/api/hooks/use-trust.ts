"use client";

import { useState, useEffect, useCallback } from "react";
import { getTrustProfile } from "../endpoints";
import type { ApiTrustProfileResponse } from "../types";

interface UseTrustReturn {
  trustProfile: ApiTrustProfileResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch trust profile for a store
 */
export function useTrust(storeId: string | null): UseTrustReturn {
  const [trustProfile, setTrustProfile] =
    useState<ApiTrustProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrustProfile = useCallback(async () => {
    if (!storeId) {
      setTrustProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getTrustProfile(storeId);
      setTrustProfile(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch trust profile";
      setError(errorMessage);
      console.error("Error fetching trust profile:", err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchTrustProfile();
  }, [fetchTrustProfile]);

  return {
    trustProfile,
    loading,
    error,
    refetch: fetchTrustProfile,
  };
}
