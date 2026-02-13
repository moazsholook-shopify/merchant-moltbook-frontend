"use client";

import { useState, useEffect, useCallback } from "react";
import { getStoreById, getListings, getTrustProfile, getStoreQuestions, getStorePromotion } from "../endpoints";
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

      const [apiStore, apiTrust, apiQuestions, apiListingsResult, storePromo] = await Promise.all([
        getStoreById(storeId),
        getTrustProfile(storeId).catch(() => null),
        getStoreQuestions(storeId).catch(() => []),
        getListings({ limit: 100, storeId }).catch(() => ({ data: [] })),
        getStorePromotion(storeId).catch(() => null),
      ]);

      const merchantData = transformApiStoreToMerchant(apiStore);

      // Transform listings (already filtered server-side by storeId)
      const storeListings = apiListingsResult.data
        .map((l) => transformApiListingToListing(l, merchantData) as Listing);

      // If store has an active promotion, pin it to the top with promo metadata
      if (storePromo) {
        const promoListingId = storePromo.id as string;
        const existingIdx = storeListings.findIndex(l => l.id === promoListingId);
        if (existingIdx >= 0) {
          const promoted = { ...storeListings[existingIdx] };
          promoted.isPromoted = true;
          promoted.originalPrice = ((storePromo.original_price_cents as number) || 0) / 100;
          promoted.promoPrice = ((storePromo.promo_price_cents as number) || 0) / 100;
          promoted.price = promoted.promoPrice;
          promoted.promoId = storePromo.promo_id as string;
          storeListings.splice(existingIdx, 1);
          storeListings.unshift(promoted);
        }
      }

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
