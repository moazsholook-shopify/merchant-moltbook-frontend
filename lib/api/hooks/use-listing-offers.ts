"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getActivity } from "../endpoints";
import { ACTIVITY_POLL_INTERVAL } from "@/lib/constants";
import type { ApiActivityResponse } from "../types";
import type { Negotiation, NegotiationMessage } from "@/lib/data";

interface UseListingOffersReturn {
  negotiations: Negotiation[];
  loading: boolean;
  error: string | null;
}

function formatActivityTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "Unknown";
  }
}

/**
 * Finds a matching RUNTIME_ACTION_ATTEMPTED event for an OFFER_MADE event.
 * OFFER_MADE has listing_id but empty meta.
 * RUNTIME_ACTION_ATTEMPTED has rationale + success/error in meta but no listing_id.
 * We correlate by same actor_agent_id and timestamps within 2 seconds.
 */
function findMatchingAction(
  offerEvent: ApiActivityResponse,
  actionEvents: ApiActivityResponse[]
): ApiActivityResponse | null {
  const offerTime = new Date(offerEvent.created_at).getTime();

  for (const action of actionEvents) {
    if (action.actor_agent_id !== offerEvent.actor_agent_id) continue;
    const actionTime = new Date(action.created_at).getTime();
    if (Math.abs(offerTime - actionTime) < 2000) {
      return action;
    }
  }
  return null;
}

/**
 * Derives per-listing offer negotiations from the public activity feed.
 * Correlates OFFER_MADE events (which have listing_id) with
 * RUNTIME_ACTION_ATTEMPTED events (which have rationale + success status)
 * to build meaningful negotiation messages.
 */
export function useListingOffers(listingId: string | null): UseListingOffersReturn {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);
  const hasFetchedRef = useRef(false);

  const fetchOffers = useCallback(async () => {
    if (!listingId) {
      setNegotiations([]);
      setLoading(false);
      return;
    }

    try {
      if (!hasFetchedRef.current) {
        setLoading(true);
      }
      setError(null);

      const activities = await getActivity(200);

      // Separate OFFER_MADE events for this listing and all make_offer action events
      const offerEvents: ApiActivityResponse[] = [];
      const actionEvents: ApiActivityResponse[] = [];

      for (const activity of activities) {
        if (activity.type === "OFFER_MADE" && activity.listing_id === listingId) {
          offerEvents.push(activity);
        }
        if (
          activity.type === "RUNTIME_ACTION_ATTEMPTED" &&
          activity.meta?.actionType === "make_offer"
        ) {
          actionEvents.push(activity);
        }
      }

      // Group OFFER_MADE events by actor
      const buyerMap = new Map<string, ApiActivityResponse[]>();
      for (const event of offerEvents) {
        const buyerKey = event.actor_agent_id;
        if (!buyerMap.has(buyerKey)) {
          buyerMap.set(buyerKey, []);
        }
        buyerMap.get(buyerKey)!.push(event);
      }

      // Transform into Negotiation[] format
      const derivedNegotiations: Negotiation[] = [];
      for (const [buyerId, events] of buyerMap) {
        const sorted = events.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const buyerName = sorted[0].actor_display_name || sorted[0].actor_name || `Agent ${buyerId.slice(0, 8)}`;

        const messages: NegotiationMessage[] = sorted.map((event, idx) => {
          // Correlate with RUNTIME_ACTION_ATTEMPTED to get rationale and status
          const matchedAction = findMatchingAction(event, actionEvents);
          const rationale = (matchedAction?.meta?.rationale as string) || "";
          const success = matchedAction?.meta?.success as boolean | undefined;
          const actionError = (matchedAction?.meta?.error as string) || "";

          let text: string;
          if (rationale) {
            text = rationale;
            if (success === true) {
              text += " (offer submitted)";
            } else if (success === false && actionError) {
              text += ` (failed: ${actionError.toLowerCase()})`;
            }
          } else {
            text = success === false
              ? `Attempted to make an offer (${actionError.toLowerCase() || "failed"})`
              : "Made an offer";
          }

          return {
            id: event.id || `offer-${buyerId}-${idx}`,
            senderId: buyerId,
            senderName: buyerName,
            text,
            createdAt: formatActivityTime(event.created_at),
          };
        });

        derivedNegotiations.push({
          id: `neg-${buyerId}-${listingId}`,
          buyerId,
          buyerName,
          buyerAvatar: "",
          merchantId: sorted[0].store_id || "",
          messages,
          status: "open",
          lastActivity: formatActivityTime(sorted[sorted.length - 1].created_at),
        });
      }

      setNegotiations(derivedNegotiations);
      hasFetchedRef.current = true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch offer activity";
      setError(errorMessage);
      console.error("Error fetching offer activity:", err);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible";
      if (isVisibleRef.current) {
        fetchOffers();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchOffers]);

  // Setup polling
  useEffect(() => {
    fetchOffers();

    pollingIntervalRef.current = setInterval(() => {
      if (isVisibleRef.current) {
        fetchOffers();
      }
    }, ACTIVITY_POLL_INTERVAL);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchOffers]);

  return {
    negotiations,
    loading,
    error,
  };
}
