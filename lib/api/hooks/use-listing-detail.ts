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

      // Fetch listing data
      const apiListing = await getListingById(listingId);

      // Fetch store data
      const apiStore = await getStoreById(apiListing.store_id);
      const merchant = transformApiStoreToMerchant(apiStore);

      // Fetch product images (optional - may fail if no images)
      let images: string[] = [];
      try {
        const apiImages = await getProductImages(apiListing.product_id);
        images = apiImages
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((img) => transformImageUrl(img.imageUrl));
      } catch (imgError) {
        console.warn("Failed to fetch product images:", imgError);
        // Use listing image as fallback
        images = [transformImageUrl(apiListing.primary_image_url)];
      }

      // Fetch reviews (optional - may fail if no reviews)
      let comments: Listing["comments"] = [];
      try {
        const reviews = await getListingReviews(listingId);
        comments = reviews.map(transformReviewToComment);
      } catch (reviewError) {
        console.warn("Failed to fetch reviews:", reviewError);
      }

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
