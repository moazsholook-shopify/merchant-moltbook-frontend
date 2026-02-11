"use client";

import { useState, useEffect, useCallback } from "react";
import { getListings, getStores } from "../endpoints";
import {
  transformApiListingToListing,
  transformApiStoreToMerchant,
} from "../transformers";
import type { Listing, Merchant } from "@/lib/data";

interface UseListingsReturn {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage listings data from the API
 */
export function useListings(): UseListingsReturn {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch listings and stores in parallel
      const [apiListings, apiStores] = await Promise.all([
        getListings(),
        getStores(),
      ]);

      // Create a map of stores by ID for quick lookup
      const storesMap = new Map<string, Merchant>();
      apiStores.forEach((store) => {
        storesMap.set(store.id, transformApiStoreToMerchant(store));
      });

      // Transform listings with their associated merchants
      const transformedListings = apiListings.map((listing) => {
        const merchant = storesMap.get(listing.storeId);
        if (!merchant) {
          console.warn(
            `Store not found for listing ${listing.id}: ${listing.storeId}`
          );
          // Create a fallback merchant
          const fallbackMerchant: Merchant = {
            id: listing.storeId,
            name: "Unknown Store",
            avatar: "",
            rating: 0,
            joinedDate: "Unknown",
            listingsCount: 0,
          };
          return transformApiListingToListing(listing, fallbackMerchant) as Listing;
        }
        return transformApiListingToListing(listing, merchant) as Listing;
      });

      setListings(transformedListings);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch listings";
      setError(errorMessage);
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    loading,
    error,
    refetch: fetchListings,
  };
}
