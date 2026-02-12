"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getListings, getStores } from "../endpoints";
import {
  transformApiListingToListing,
  transformApiStoreToMerchant,
} from "../transformers";
import { LISTINGS_POLL_INTERVAL } from "@/lib/constants";
import type { Listing, Merchant } from "@/lib/data";

interface UseListingsReturn {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Cache image validation results so each URL is only checked once
const imageValidationCache = new Map<string, boolean>();

async function isImageValid(url: string): Promise<boolean> {
  if (!url) return false;
  if (imageValidationCache.has(url)) return imageValidationCache.get(url)!;
  try {
    const res = await fetch(`/api/check-image?url=${encodeURIComponent(url)}`);
    const { valid } = await res.json();
    imageValidationCache.set(url, valid);
    return valid;
  } catch {
    imageValidationCache.set(url, false);
    return false;
  }
}

/**
 * Hook to fetch and manage listings data from the API
 * Polls for new listings and pauses when tab is hidden
 */
export function useListings(): UseListingsReturn {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);
  const hasFetchedRef = useRef(false);

  const fetchListings = useCallback(async () => {
    try {
      // Only show loading spinner on initial fetch
      if (!hasFetchedRef.current) {
        setLoading(true);
      }
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
        const merchant = storesMap.get(listing.store_id);
        if (!merchant) {
          console.warn(
            `Store not found for listing ${listing.id}: ${listing.store_id}`
          );
          // Create a fallback merchant
          const fallbackMerchant: Merchant = {
            id: listing.store_id,
            name: listing.store_name || "Unknown Store",
            avatar: "",
            rating: 0,
            joinedDate: "Unknown",
            listingsCount: 0,
          };
          return transformApiListingToListing(listing, fallbackMerchant) as Listing;
        }
        return transformApiListingToListing(listing, merchant) as Listing;
      });

      // Filter out listings whose images 404
      const validationResults = await Promise.all(
        transformedListings.map((listing) => isImageValid(listing.image))
      );
      const validListings = transformedListings.filter((_, i) => validationResults[i]);

      setListings(validListings);
      hasFetchedRef.current = true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch listings";
      setError(errorMessage);
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle visibility change to pause/resume polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible";

      // If tab becomes visible, fetch immediately
      if (isVisibleRef.current) {
        fetchListings();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchListings]);

  // Setup polling
  useEffect(() => {
    // Initial fetch
    fetchListings();

    // Setup polling interval
    pollingIntervalRef.current = setInterval(() => {
      // Only poll if tab is visible
      if (isVisibleRef.current) {
        fetchListings();
      }
    }, LISTINGS_POLL_INTERVAL);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchListings]);

  return {
    listings,
    loading,
    error,
    refetch: fetchListings,
  };
}
