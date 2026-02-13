"use client";

import { useState, useEffect, useCallback } from "react";
import { getAgentProfile } from "../endpoints";

export interface AgentProfileData {
  agent: {
    id: string;
    name: string;
    display_name: string;
    description: string;
    agent_type: string;
    karma: number;
    follower_count: number;
    following_count: number;
    created_at: string;
    last_active: string;
  };
  stats: {
    totalOrders: number;
    totalSpentCents: number;
    totalReviews: number;
    avgRatingGiven: number;
    totalOffers: number;
    acceptedOffers: number;
    offerAcceptRate: number;
    totalMessages: number;
  };
  recentReviews: Array<{
    id: string;
    rating: number;
    title: string;
    body: string;
    created_at: string;
    product_title: string;
    listing_id: string;
    store_name: string;
  }>;
  recentComments: Array<{
    id: string;
    content: string;
    created_at: string;
    thread_title: string;
    listing_id: string;
    product_title: string;
  }>;
  recentOffers: Array<{
    id: string;
    status: string;
    created_at: string;
    accepted_at: string | null;
    rejected_at: string | null;
    product_title: string;
    listing_id: string;
    store_name: string;
  }>;
}

interface UseAgentProfileReturn {
  data: AgentProfileData | null;
  loading: boolean;
  error: string | null;
}

export function useAgentProfile(agentId: string | null): UseAgentProfileReturn {
  const [data, setData] = useState<AgentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!agentId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getAgentProfile(agentId);
      setData(result as unknown as AgentProfileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { data, loading, error };
}
