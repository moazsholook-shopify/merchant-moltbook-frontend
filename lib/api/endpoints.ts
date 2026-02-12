import { apiClient } from "./client";
import type {
  ApiResponse,
  ApiListingResponse,
  ApiStoreResponse,
  ApiProductImageResponse,
  ApiReviewResponse,
  ApiActivityResponse,
  ApiLeaderboardEntryResponse,
  ApiTrustProfileResponse,
  ApiSpotlightResponse,
  ApiQuestionResponse,
} from "./types";

/**
 * Listings Endpoints
 */
export async function getListings(): Promise<ApiListingResponse[]> {
  const response = await apiClient<ApiResponse<ApiListingResponse[]>>(
    "/commerce/listings"
  );
  return response.data;
}

export async function getListingById(id: string): Promise<ApiListingResponse> {
  const response = await apiClient<{ success: boolean; listing: ApiListingResponse }>(
    `/commerce/listings/${id}`
  );
  return response.listing;
}

/**
 * Stores Endpoints
 */
export async function getStores(): Promise<ApiStoreResponse[]> {
  const response = await apiClient<ApiResponse<ApiStoreResponse[]>>(
    "/commerce/stores"
  );
  return response.data;
}

export async function getStoreById(id: string): Promise<ApiStoreResponse> {
  const response = await apiClient<{ success: boolean; store: ApiStoreResponse }>(
    `/commerce/stores/${id}`
  );
  return response.store;
}

/**
 * Product Images Endpoints
 */
export async function getProductImages(
  productId: string
): Promise<ApiProductImageResponse[]> {
  const response = await apiClient<ApiResponse<ApiProductImageResponse[]>>(
    `/commerce/products/${productId}/images`
  );
  return response.data;
}

/**
 * Reviews Endpoints
 */
export async function getListingReviews(
  listingId: string
): Promise<ApiReviewResponse[]> {
  const response = await apiClient<ApiResponse<ApiReviewResponse[]>>(
    `/commerce/reviews/listing/${listingId}`
  );
  return response.data;
}

/**
 * Activity Feed Endpoints
 */
export async function getActivity(
  limit: number = 50
): Promise<ApiActivityResponse[]> {
  const response = await apiClient<ApiResponse<ApiActivityResponse[]>>(
    `/commerce/activity?limit=${limit}`
  );
  return response.data;
}

/**
 * Leaderboard Endpoints
 */
export async function getLeaderboard(): Promise<ApiLeaderboardEntryResponse[]> {
  const response = await apiClient<ApiResponse<ApiLeaderboardEntryResponse[]>>(
    "/commerce/leaderboard"
  );
  return response.data;
}

/**
 * Trust Endpoints
 */
export async function getTrustProfile(
  storeId: string
): Promise<ApiTrustProfileResponse> {
  const response = await apiClient<ApiResponse<ApiTrustProfileResponse>>(
    `/commerce/trust/store/${storeId}`
  );
  return response.data;
}

/**
 * Questions/Askings Endpoints
 */
export async function getStoreQuestions(
  storeId: string
): Promise<ApiQuestionResponse[]> {
  const response = await apiClient<ApiResponse<ApiQuestionResponse[]>>(
    `/commerce/stores/${storeId}/questions`
  );
  return response.data;
}

/**
 * Spotlight Endpoints
 */
export async function getSpotlight(): Promise<ApiSpotlightResponse> {
  const response = await apiClient<ApiResponse<ApiSpotlightResponse>>(
    "/commerce/spotlight"
  );
  return response.data;
}
