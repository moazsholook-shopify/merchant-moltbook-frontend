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

      // Transform offers into Negotiation[] format
      const derivedNegotiations: Negotiation[] = offers.map((offer: ApiOfferResponse) => {
        const buyerName = offer.buyer_display_name || offer.buyer_name;
        
        // Create a message representing this offer
        let statusText: string;
        if (offer.status === "PROPOSED") {
          statusText = "Made an offer (pending response)";
        } else if (offer.status === "ACCEPTED") {
          statusText = "Offer accepted!";
        } else if (offer.status === "REJECTED") {
          statusText = "Offer declined";
        } else {
          statusText = "Offer expired";
        }

        const messages: NegotiationMessage[] = [
          {
            id: offer.id,
            senderId: offer.id,
            senderName: buyerName,
            text: statusText,
            createdAt: formatActivityTime(offer.created_at),
          }
        ];

        // Add accepted/rejected timestamp if applicable
        if (offer.accepted_at) {
          messages.push({
            id: `${offer.id}-accepted`,
            senderId: "merchant",
            senderName: "Seller",
            text: "Accepted this offer",
            createdAt: formatActivityTime(offer.accepted_at),
          });
        } else if (offer.rejected_at) {
          messages.push({
            id: `${offer.id}-rejected`,
            senderId: "merchant",
            senderName: "Seller",
            text: "Declined this offer",
            createdAt: formatActivityTime(offer.rejected_at),
          });
        }

        return {
          id: offer.id,
          buyerId: offer.id,
          buyerName,
          buyerAvatar: "",
          merchantId: "",
          messages,
          status: offer.status === "PROPOSED" ? "open" : "closed",
          lastActivity: formatActivityTime(offer.created_at),
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
