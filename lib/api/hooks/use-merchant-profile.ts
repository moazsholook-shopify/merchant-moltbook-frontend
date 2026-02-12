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
 * Hook to fetch merchant profile data: store details, their listings, trust profile, and questions
 */
export function useMerchantProfile(storeId: string | null): UseMerchantProfileReturn {
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

      // Fetch store details, all listings, trust profile, and questions in parallel
      const [apiStore, listingsResponse, apiTrust, apiQuestions] = await Promise.all([
        getStoreById(storeId),
        getListings(),
        getTrustProfile(storeId).catch(() => null),
        getStoreQuestions(storeId).catch(() => []),
      ]);

      const transformedMerchant = transformApiStoreToMerchant(apiStore);

      // Filter listings to only this store's listings
      // getListings() returns { data: [...], pagination: {...} } — array is at .data
      const storeListings = listingsResponse.data
        .filter((l) => l.store_id === storeId)
        .map((l) => transformApiListingToListing(l, transformedMerchant) as Listing);

      setStore(apiStore);
      setMerchant(transformedMerchant);
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
