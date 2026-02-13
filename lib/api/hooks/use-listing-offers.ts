"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getListingOffers } from "../endpoints";
import { ACTIVITY_POLL_INTERVAL } from "@/lib/constants";
import type { ApiOfferResponse } from "../types";
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
 * Fetches offers for a listing from the API.
 * Transforms offers into the Negotiation format for display.
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

      const offers = await getListingOffers(listingId);

      // Transform offers into Negotiation[] format with real messages
      const extOffers = offers as (ApiOfferResponse & { buyer_message?: string; merchant_response?: string })[];
      const derivedNegotiations: Negotiation[] = extOffers.map((offer) => {
        const buyerName = offer.buyer_display_name || offer.buyer_name;
        const messages: NegotiationMessage[] = [];

        // Message 1: Buyer's actual message (or generic fallback)
        const buyerText = offer.buyer_message && offer.buyer_message.trim().length > 0
          ? offer.buyer_message
          : "Made an offer on this listing";

        messages.push({
          id: offer.id,
          senderId: offer.id,
          senderName: buyerName,
          text: buyerText,
          createdAt: formatActivityTime(offer.created_at),
        });

        // Message 2: Merchant's response (with actual message if available)
        if (offer.accepted_at) {
          const merchantText = offer.merchant_response
            ? `${offer.merchant_response}`
            : "Offer accepted! Deal confirmed.";
          messages.push({
            id: `${offer.id}-accepted`,
            senderId: "merchant",
            senderName: "Seller",
            text: `✅ ${merchantText}`,
            createdAt: formatActivityTime(offer.accepted_at),
          });
        } else if (offer.rejected_at) {
          const merchantText = offer.merchant_response
            ? `${offer.merchant_response}`
            : "Offer declined.";
          messages.push({
            id: `${offer.id}-rejected`,
            senderId: "merchant",
            senderName: "Seller",
            text: `❌ ${merchantText}`,
            createdAt: formatActivityTime(offer.rejected_at),
          });
        } else {
          messages.push({
            id: `${offer.id}-pending`,
            senderId: "system",
            senderName: "System",
            text: "⏳ Awaiting merchant response...",
            createdAt: formatActivityTime(offer.created_at),
          });
        }

        return {
          id: offer.id,
          buyerId: offer.id,
          buyerName,
          buyerAvatar: "",
          merchantId: "",
          messages,
          status: offer.status === "PROPOSED" ? "open" : (offer.status === "ACCEPTED" ? "accepted" : "declined") as "open" | "accepted" | "declined",
          lastActivity: formatActivityTime(offer.accepted_at || offer.rejected_at || offer.created_at),
        };
      });

      setNegotiations(derivedNegotiations);
      hasFetchedRef.current = true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch offers";
      setError(errorMessage);
      console.error("Error fetching offers:", err);
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
