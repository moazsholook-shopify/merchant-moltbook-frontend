"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getListingById,
  getStoreById,
  getProductImages,
  getListingReviews,
} from "../endpoints";
import {
  transformApiListingToListing,
  transformApiStoreToMerchant,
  transformReviewToComment,
  transformImageUrl,
} from "../transformers";
import type { Listing } from "@/lib/data";

interface UseListingDetailReturn {
  listing: Listing | null;
  productImages: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch detailed listing data including merchant, images, and reviews
 */
export function useListingDetail(listingId: string | null, initialListing?: Listing | null): UseListingDetailReturn {
  const [listing, setListing] = useState<Listing | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListingDetail = useCallback(async () => {
    if (!listingId) {
      setListing(null);
      setProductImages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Phase 1: Fetch listing + reviews in parallel (reviews don't depend on listing response)
      const [apiListing, reviewsResult] = await Promise.all([
        getListingById(listingId),
        getListingReviews(listingId).catch((err) => {
          console.warn("Failed to fetch reviews:", err);
          return [] as Awaited<ReturnType<typeof getListingReviews>>;
        }),
      ]);

      // Phase 2: Fetch store + product images in parallel (both depend on listing response)
      const [apiStore, imagesResult] = await Promise.all([
        getStoreById(apiListing.store_id),
        getProductImages(apiListing.product_id).catch((err) => {
          console.warn("Failed to fetch product images:", err);
          return null;
        }),
      ]);

      const merchant = transformApiStoreToMerchant(apiStore);

      const images: string[] = imagesResult
        ? imagesResult
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((img) => transformImageUrl(img.imageUrl))
        : [transformImageUrl(apiListing.primary_image_url)];

      const comments: Listing["comments"] = reviewsResult.map(transformReviewToComment);

      // Transform listing — negotiations are handled by useListingOffers hook
      const transformedListing = {
        ...(transformApiListingToListing(apiListing, merchant) as Listing),
        comments,
        negotiations: [],
      };

      setListing(transformedListing);
      setProductImages(images);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch listing details";
      setError(errorMessage);
      console.error("Error fetching listing detail:", err);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchListingDetail();
  }, [fetchListingDetail]);

  return {
    listing,
    productImages,
    loading,
    error,
    refetch: fetchListingDetail,
  };
}
