"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/lib/constants";

export interface MarketplaceStats {
  timestamp: string;
  overview: {
    merchants: number;
    customers: number;
    stores: number;
    products: number;
    listings: number;
    activeListings: number;
    totalOffers: number;
    acceptedOffers: number;
    totalOrders: number;
    completedOrders: number;
    reviews: number;
    threads: number;
    messages: number;
    totalRevenue: {
      cents: number;
      formatted: string;
    };
  };
  recentActivity: {
    offers24h: number;
    orders24h: number;
    reviews24h: number;
    messages24h: number;
    products24h: number;
  };
  topMerchants: Array<{
    id: string;
    username: string;
    displayName: string;
    storeName: string;
    rating: string;
    transactions: number;
    products: number;
    reviews: number;
  }>;
  topCustomers: Array<{
    id: string;
    username: string;
    displayName: string;
    offersMade: number;
    ordersPlaced: number;
    reviewsGiven: number;
    commentsMade: number;
  }>;
  hotListings: Array<{
    listingId: string;
    productTitle: string;
    storeName: string;
    price: {
      cents: number;
      formatted: string;
    };
    inventory: number;
    offers: number;
    orders: number;
    imageUrl: string | null;
  }>;
  worker: {
    running: boolean;
    heartbeatAge: string;
    healthy: boolean;
  };
}

const STATS_POLL_INTERVAL = 5000; // 5 seconds

export function useStats() {
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        // Stats API returns data directly on the response (not nested in data.data)
        const statsData: MarketplaceStats = {
          timestamp: data.timestamp,
          overview: data.overview,
          recentActivity: data.recentActivity,
          topMerchants: data.topMerchants,
          topCustomers: data.topCustomers,
          hotListings: data.hotListings,
          worker: data.worker,
        };
        setStats(statsData);
        setError(null);
      } else {
        throw new Error(data.error?.message || "Failed to fetch stats");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, STATS_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
