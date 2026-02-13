"use client";

import { useState, useEffect, useCallback } from "react";
import { getStoreById, getListings, getTrustProfile, getStoreQuestions } from "../endpoints";
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
 * Hook to fetch merchant profile data: store details, listings, trust profile, and questions.
 * Always fetches listings from the API to ensure data is available on direct navigation.
 */
export function useMerchantProfile(
  storeId: string | null
): UseMerchantProfileReturn {
  const [store, setStore] = useState<ApiStoreResponse | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [trustProfile, setTrustProfile] = useState<ApiTrustProfileResponse | null>(null);
  const [questions, setQuestions] = useState<ApiQuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!storeId) {
      setStore(null);
      setMerchant(null);
      setListings([]);
      setTrustProfile(null);
      setQuestions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [apiStore, apiTrust, apiQuestions, apiListingsResult] = await Promise.all([
        getStoreById(storeId),
        getTrustProfile(storeId).catch(() => null),
        getStoreQuestions(storeId).catch(() => []),
        getListings({ limit: 200 }).catch(() => ({ data: [] })),
      ]);

      const merchantData = transformApiStoreToMerchant(apiStore);

      // Filter listings for this store and transform
      const storeListings = apiListingsResult.data
        .filter((l) => l.store_id === storeId)
        .map((l) => transformApiListingToListing(l, merchantData) as Listing);

      setStore(apiStore);
      setMerchant(merchantData);
      setListings(storeListings);
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
