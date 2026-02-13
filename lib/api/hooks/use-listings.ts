"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getListings, getStores } from "../endpoints";
import {
  transformApiListingToListing,
  transformApiStoreToMerchant,
} from "../transformers";
import { LISTINGS_POLL_INTERVAL } from "@/lib/constants";
import type { Listing, Merchant } from "@/lib/data";
import type { ApiStoreResponse } from "../types";

const PAGE_SIZE = 30;

interface UseListingsReturn {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  page: number;
  totalLoaded: number;
  hasMore: boolean;
  loadPage: (page: number) => Promise<void>;
}

/**
 * Hook to fetch listings with server-side pagination.
 * Initial load is fast (first 30 items). More pages fetched on demand.
 */
export function useListings(): UseListingsReturn {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const storesMapRef = useRef<Map<string, Merchant>>(new Map());
  const storesRawRef = useRef<ApiStoreResponse[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);
  const hasFetchedRef = useRef(false);
  const pageRef = useRef(1);

  const buildStoresMap = useCallback((apiStores: ApiStoreResponse[]) => {
    const map = new Map<string, Merchant>();
    apiStores.forEach((store) => {
      map.set(store.id, transformApiStoreToMerchant(store));
    });
    storesMapRef.current = map;
    storesRawRef.current = apiStores;
    return map;
  }, []);

  const transformListings = useCallback((apiListings: Parameters<typeof transformApiListingToListing>[0][], storesMap: Map<string, Merchant>) => {
    return apiListings.map((listing) => {
      const merchant = storesMap.get(listing.store_id);
      if (!merchant) {
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
  }, []);

  const fetchPage = useCallback(async (pageNum: number, isRefresh = false) => {
    try {
      if (!hasFetchedRef.current) {
        setLoading(true);
      }
      setError(null);

      const offset = (pageNum - 1) * PAGE_SIZE;

      // On first load or refresh, fetch stores too
      let storesMap = storesMapRef.current;
      if (storesMap.size === 0 || isRefresh) {
        const [listingsResponse, apiStores] = await Promise.all([
          getListings({ limit: PAGE_SIZE, offset }),
          getStores(),
        ]);
        storesMap = buildStoresMap(apiStores);
        const transformed = transformListings(listingsResponse.data, storesMap);
        setListings(transformed);
        setHasMore(listingsResponse.data.length === PAGE_SIZE);
      } else {
        // Subsequent pages — only fetch listings
        const listingsResponse = await getListings({ limit: PAGE_SIZE, offset });
        const transformed = transformListings(listingsResponse.data, storesMap);
        setListings(transformed);
        setHasMore(listingsResponse.data.length === PAGE_SIZE);
      }

      setPage(pageNum);
      pageRef.current = pageNum;
      hasFetchedRef.current = true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch listings";
      setError(errorMessage);
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  }, [buildStoresMap, transformListings]);

  const loadPage = useCallback(async (pageNum: number) => {
    await fetchPage(pageNum);
  }, [fetchPage]);

  // Visibility change handler — refresh current page when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible";
      if (isVisibleRef.current && hasFetchedRef.current) {
        fetchPage(pageRef.current, true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchPage]);

  // Initial fetch only (once)
  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  // Polling — uses ref to always poll current page without re-creating the interval
  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => {
      if (isVisibleRef.current && hasFetchedRef.current) {
        fetchPage(pageRef.current, true);
      }
    }, LISTINGS_POLL_INTERVAL);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [fetchPage]);

  return {
    listings,
    loading,
    error,
    refetch: () => fetchPage(pageRef.current, true),
    page,
    totalLoaded: listings.length,
    hasMore,
    loadPage,
  };
}
