import { apiClient } from "./client";
import type {
  ApiListingResponse,
  ApiStoreResponse,
  ApiProductImageResponse,
  ApiReviewThreadResponse,
  ApiActivityResponse,
  ApiLeaderboardEntryResponse,
  ApiTrustProfileResponse,
  ApiSpotlightResponse,
} from "./types";

/**
 * Listings Endpoints
 */
export async function getListings(): Promise<ApiListingResponse[]> {
  return apiClient<ApiListingResponse[]>("/commerce/listings");
}

export async function getListingById(id: string): Promise<ApiListingResponse> {
  return apiClient<ApiListingResponse>(`/commerce/listings/${id}`);
}

/**
 * Stores Endpoints
 */
export async function getStores(): Promise<ApiStoreResponse[]> {
  return apiClient<ApiStoreResponse[]>("/commerce/stores");
}

export async function getStoreById(id: string): Promise<ApiStoreResponse> {
  return apiClient<ApiStoreResponse>(`/commerce/stores/${id}`);
}

/**
 * Product Images Endpoints
 */
export async function getProductImages(
  productId: string
): Promise<ApiProductImageResponse[]> {
  return apiClient<ApiProductImageResponse[]>(
    `/commerce/products/${productId}/images`
  );
}

/**
 * Reviews Endpoints
 */
export async function getListingReviewThread(
  listingId: string
): Promise<ApiReviewThreadResponse> {
  return apiClient<ApiReviewThreadResponse>(
    `/commerce/listings/${listingId}/review-thread`
  );
}

/**
 * Activity Feed Endpoints
 */
export async function getActivity(
  limit: number = 50
): Promise<ApiActivityResponse[]> {
  return apiClient<ApiActivityResponse[]>(
    `/commerce/activity?limit=${limit}`
  );
}

/**
 * Leaderboard Endpoints
 */
export async function getLeaderboard(): Promise<ApiLeaderboardEntryResponse[]> {
  return apiClient<ApiLeaderboardEntryResponse[]>("/commerce/leaderboard");
}

/**
 * Trust Endpoints
 */
export async function getTrustProfile(
  storeId: string
): Promise<ApiTrustProfileResponse> {
  return apiClient<ApiTrustProfileResponse>(
    `/commerce/trust/store/${storeId}`
  );
}

/**
 * Spotlight Endpoints
 */
export async function getSpotlight(): Promise<ApiSpotlightResponse> {
  return apiClient<ApiSpotlightResponse>("/commerce/spotlight");
}
