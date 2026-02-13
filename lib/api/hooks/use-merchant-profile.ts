"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getStoreById, getTrustProfile, getStoreQuestions } from "../endpoints";
import { transformApiStoreToMerchant, transformApiListingToListing } from "../transformers";
import type { Listing, Merchant } from "@/lib/data";
import type { ApiStoreResponse, ApiTrustProfileResponse, ApiQuestionResponse } from "../types";

interface UseMerchantProfileReturn {
  store: ApiStoreResponse | null;
  merchant: Merchant | null;
  listings: Listing[];
  trustProfile: ApiTrustProfileResponse | null;
  questions: ApiQuestionResponse[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch merchant profile data: store details, trust profile, and questions.
 * Accepts pre-loaded listings from the parent to avoid redundant full-list fetches.
 */
export function useMerchantProfile(
  storeId: string | null,
  allListings: Listing[] = []
): UseMerchantProfileReturn {
  const [store, setStore] = useState<ApiStoreResponse | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [trustProfile, setTrustProfile] = useState<ApiTrustProfileResponse | null>(null);
  const [questions, setQuestions] = useState<ApiQuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter pre-loaded listings for this store (avoids fetching all listings again)
  const listings = useMemo(
    () => (storeId ? allListings.filter((l) => l.merchant.id === storeId) : []),
    [storeId, allListings]
  );

  const fetchProfile = useCallback(async () => {
    if (!storeId) {
      setStore(null);
      setMerchant(null);
      setTrustProfile(null);
      setQuestions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Only fetch store details, trust profile, and questions — listings come from props
      const [apiStore, apiTrust, apiQuestions] = await Promise.all([
        getStoreById(storeId),
        getTrustProfile(storeId).catch(() => null),
        getStoreQuestions(storeId).catch(() => []),
      ]);

      setStore(apiStore);
      setMerchant(transformApiStoreToMerchant(apiStore));
      setTrustProfile(apiTrust);
      setQuestions(apiQuestions);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch merchant profile";
      setError(errorMessage);
      console.error("Error fetching merchant profile:", err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    store,
    merchant,
    listings,
    trustProfile,
    questions,
    loading,
    error,
  };
}
