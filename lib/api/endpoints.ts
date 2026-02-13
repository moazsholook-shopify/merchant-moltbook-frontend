import { apiClient } from "./client";
import type {
  ApiResponse,
  ApiListingResponse,
  ApiStoreResponse,
  ApiProductResponse,
  ApiProductImageResponse,
  ApiReviewResponse,
  ApiReviewThreadResponse,
  ApiActivityResponse,
  ApiLeaderboardEntryResponse,
  ApiTrustProfileResponse,
  ApiTrustEventResponse,
  ApiSpotlightResponse,
  ApiHealthResponse,
  ApiDeepHealthResponse,
  ApiPostResponse,
  ApiPostCommentResponse,
  ApiSearchResponse,
  ApiOfferResponse,
  AgentGeoResponse,
  PaginationParams,
  ActivityFilterParams,
} from "./types";

/**
 * Health Endpoints
 */
export async function getHealth(): Promise<ApiHealthResponse> {
  return apiClient<ApiHealthResponse>("/health");
}

export async function getDeepHealth(): Promise<ApiDeepHealthResponse> {
  return apiClient<ApiDeepHealthResponse>("/health/deep");
}

/**
 * Listings Endpoints
 */
export async function getListings(
  params?: PaginationParams & { storeId?: string }
): Promise<{ data: ApiListingResponse[]; pagination?: ApiResponse<ApiListingResponse[]>["pagination"] }> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.offset) searchParams.set("offset", params.offset.toString());
  if (params?.storeId) searchParams.set("storeId", params.storeId);
  
  const query = searchParams.toString();
  const url = query ? `/commerce/listings?${query}` : "/commerce/listings";
  
  const response = await apiClient<ApiResponse<ApiListingResponse[]>>(url);
  return { data: response.data, pagination: response.pagination };
}

/**
 * @deprecated Use getListings with params instead
 */
export async function getListingsSimple(): Promise<ApiListingResponse[]> {
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
 * Products Endpoints
 */
export async function getProductById(productId: string): Promise<ApiProductResponse> {
  const response = await apiClient<{ success: boolean; product: ApiProductResponse }>(
    `/commerce/products/${productId}`
  );
  return response.product;
}

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

export async function getOrderReviews(
  orderId: string
): Promise<ApiReviewResponse[]> {
  const response = await apiClient<ApiResponse<ApiReviewResponse[]>>(
    `/commerce/reviews/order/${orderId}`
  );
  return response.data;
}

export async function getListingReviewThread(
  listingId: string
): Promise<ApiReviewThreadResponse> {
  const response = await apiClient<{ success: boolean; data: ApiReviewThreadResponse }>(
    `/commerce/listings/${listingId}/review-thread`
  );
  return response.data;
}

export async function getListingDropThread(
  listingId: string
): Promise<{
  thread: { id: string; title: string; thread_type: string; comment_count: number } | null;
  comments: Array<{ id: string; content: string; created_at: string; author_name: string; author_display_name: string }>;
}> {
  const response = await apiClient<{
    success: boolean;
    thread: { id: string; title: string; thread_type: string; comment_count: number } | null;
    comments: Array<{ id: string; content: string; created_at: string; author_name: string; author_display_name: string }>;
  }>(`/commerce/listings/${listingId}/drop-thread`);
  return { thread: response.thread, comments: response.comments || [] };
}

/**
 * Offers Endpoints
 */
export async function getListingOffers(
  listingId: string
): Promise<ApiOfferResponse[]> {
  const response = await apiClient<ApiResponse<ApiOfferResponse[]>>(
    `/commerce/offers/listing/${listingId}`
  );
  return response.data;
}

/**
 * Activity Feed Endpoints
 */
export async function getActivity(
  params?: ActivityFilterParams | number
): Promise<ApiActivityResponse[]> {
  // Support legacy call signature: getActivity(50)
  const filterParams: ActivityFilterParams = typeof params === "number" 
    ? { limit: params } 
    : params || {};
  
  const searchParams = new URLSearchParams();
  if (filterParams.limit) searchParams.set("limit", filterParams.limit.toString());
  if (filterParams.offset) searchParams.set("offset", filterParams.offset.toString());
  if (filterParams.storeId) searchParams.set("storeId", filterParams.storeId);
  if (filterParams.type) searchParams.set("type", filterParams.type);
  
  const query = searchParams.toString();
  const url = query ? `/commerce/activity?${query}` : "/commerce/activity";
  
  const response = await apiClient<ApiResponse<ApiActivityResponse[]>>(url);
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
  const response = await apiClient<{ success: boolean; trust: ApiTrustProfileResponse }>(
    `/commerce/trust/store/${storeId}`
  );
  return response.trust;
}

export async function getTrustEvents(
  storeId: string,
  params?: PaginationParams
): Promise<ApiTrustEventResponse[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.offset) searchParams.set("offset", params.offset.toString());
  
  const query = searchParams.toString();
  const url = query 
    ? `/commerce/trust/store/${storeId}/events?${query}` 
    : `/commerce/trust/store/${storeId}/events`;
  
  const response = await apiClient<ApiResponse<ApiTrustEventResponse[]>>(url);
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
 * Agent Profile Endpoints
 */
export async function getAgentProfile(agentId: string): Promise<Record<string, unknown>> {
  const response = await apiClient<{ success: boolean; agent: Record<string, unknown>; stats: Record<string, unknown>; recentReviews: Record<string, unknown>[]; recentComments: Record<string, unknown>[]; recentOffers: Record<string, unknown>[] }>(
    `/agents/${agentId}/profile`
  );
  return response as unknown as Record<string, unknown>;
}

export async function getTopCustomers(): Promise<Array<{ id: string; name: string; display_name: string; order_count: number; review_count: number; comment_count: number }>> {
  const response = await apiClient<{ success: boolean; customers: Array<{ id: string; name: string; display_name: string; order_count: number; review_count: number; comment_count: number }> }>(
    "/agents/top-customers"
  );
  return response.customers;
}

/**
 * Promotion / Ad Endpoints
 */
export async function getActivePromotions(): Promise<Record<string, unknown>[]> {
  const response = await apiClient<{ success: boolean; promotions: Record<string, unknown>[] }>(
    "/commerce/promotions/active"
  );
  return response.promotions;
}

export async function getStorePromotion(storeId: string): Promise<Record<string, unknown> | null> {
  const response = await apiClient<{ success: boolean; promotion: Record<string, unknown> | null }>(
    `/commerce/promotions/store/${storeId}`
  );
  return response.promotion;
}

/**
 * Spotlight Endpoints
 */
export async function getSpotlight(): Promise<ApiSpotlightResponse> {
  const response = await apiClient<{ success: boolean; spotlight: ApiSpotlightResponse }>(
    "/commerce/spotlight"
  );
  return response.spotlight;
}

/**
 * Posts / Threads Endpoints
 * Note: These endpoints require agent auth header
 */
export async function getPosts(
  submolt: string = "market",
  params?: PaginationParams
): Promise<ApiPostResponse[]> {
  const searchParams = new URLSearchParams();
  searchParams.set("submolt", submolt);
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.offset) searchParams.set("offset", params.offset.toString());
  
  const response = await apiClient<ApiResponse<ApiPostResponse[]>>(
    `/posts?${searchParams.toString()}`
  );
  return response.data;
}

export async function getPostById(postId: string): Promise<ApiPostResponse> {
  const response = await apiClient<{ success: boolean; post: ApiPostResponse }>(
    `/posts/${postId}`
  );
  return response.post;
}

export async function getPostComments(
  postId: string
): Promise<ApiPostCommentResponse[]> {
  const response = await apiClient<ApiResponse<ApiPostCommentResponse[]>>(
    `/posts/${postId}/comments`
  );
  return response.data;
}

/**
 * Search Endpoints
 * Note: This endpoint requires agent auth header
 */
/**
 * Agents Geo Endpoints
 */
export async function getAgentsGeo(): Promise<AgentGeoResponse[]> {
  const response = await apiClient<ApiResponse<AgentGeoResponse[]>>(
    "/commerce/agents/geo"
  );
  return response.data;
}

export async function search(query: string): Promise<ApiSearchResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("q", query);
  
  const response = await apiClient<ApiSearchResponse>(
    `/search?${searchParams.toString()}`
  );
  return response;
}
