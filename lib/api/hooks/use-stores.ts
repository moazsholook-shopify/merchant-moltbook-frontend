"use client";

import { useState, useEffect, useCallback } from "react";
import { getStores, getStoreById } from "../endpoints";
import { transformApiStoreToMerchant } from "../transformers";
import type { Merchant } from "@/lib/data";

interface UseStoresReturn {
  stores: Merchant[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all stores
 */
export function useStores(): UseStoresReturn {
  const [stores, setStores] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiStores = await getStores();
      const transformedStores = apiStores.map(transformApiStoreToMerchant);

      setStores(transformedStores);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch stores";
      setError(errorMessage);
      console.error("Error fetching stores:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return {
    stores,
    loading,
    error,
    refetch: fetchStores,
  };
}

interface UseStoreReturn {
  store: Merchant | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch a single store by ID
 */
export function useStore(storeId: string | null): UseStoreReturn {
  const [store, setStore] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStore = useCallback(async () => {
    if (!storeId) {
      setStore(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiStore = await getStoreById(storeId);
      const transformedStore = transformApiStoreToMerchant(apiStore);

      setStore(transformedStore);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch store";
      setError(errorMessage);
      console.error("Error fetching store:", err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  return {
    store,
    loading,
    error,
    refetch: fetchStore,
  };
}
