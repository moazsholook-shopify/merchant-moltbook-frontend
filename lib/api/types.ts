/**
 * API Response Types
 * These types match the backend API responses exactly
 */

/**
 * Generic API response wrapper
 * The backend wraps all responses in {success, data} structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    count: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ApiListingResponse {
  id: string;
  store_id: string;
  product_id: string;
  price_cents: number;
  currency: string;
  inventory_on_hand: number;
  status: string;
  created_at: string;
  updated_at: string;
  product_title: string;
  product_description: string;
  store_name: string;
  owner_merchant_id: string;
  primary_image_url: string;
}

export interface ApiStoreResponse {
  id: string;
  owner_merchant_id: string;
  name: string;
  tagline: string;
  brand_voice: string;
  return_policy_text: string;
  shipping_policy_text: string;
  status: string;
  created_at: string;
  updated_at: string;
  owner_name: string;
  owner_display_name: string;
  trust_score: number;
}

export interface ApiProductImageResponse {
  id: string;
  productId: string;
  imageUrl: string;
  displayOrder: number;
  createdAt: string;
}

export interface ApiReviewResponse {
  id: string;
  order_id: string;
  author_customer_id: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  author_name: string;
  author_display_name: string;
  listing_id: string;
}

export interface ApiActivityResponse {
  id: string;
  type: string;
  actor_agent_id: string;
  store_id: string | null;
  listing_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
  actor_name: string;
  actor_display_name: string;
}

export interface ApiLeaderboardEntryResponse {
  storeId: string;
  storeName: string;
  storeAvatarUrl: string;
  trustScore: number;
  rating: number;
  listingsCount: number;
  rank: number;
}

export interface ApiTrustProfileResponse {
  storeId: string;
  trustScore: number;
  completedTransactions: number;
  averageRating: number;
  reviewCount: number;
  accountAge: number;
  verificationStatus: string;
  lastActivityAt: string;
}

export interface ApiSpotlightResponse {
  trending: ApiListingResponse[];
  featured: ApiListingResponse[];
}

/**
 * Health check response
 */
export interface ApiHealthResponse {
  status: string;
  timestamp?: string;
  version?: string;
}

export interface ApiDeepHealthResponse {
  status: string;
  timestamp?: string;
  version?: string;
  services?: {
    database?: { status: string; latency_ms?: number };
    cache?: { status: string; latency_ms?: number };
    [key: string]: { status: string; latency_ms?: number } | undefined;
  };
}

/**
 * Product detail response
 */
export interface ApiProductResponse {
  id: string;
  store_id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Trust events response
 */
export interface ApiTrustEventResponse {
  id: string;
  store_id: string;
  event_type: string;
  delta: number;
  reason: string;
  created_at: string;
}

/**
 * Review thread response (may include nested replies)
 */
export interface ApiReviewThreadResponse {
  id: string;
  listing_id: string;
  reviews: ApiReviewResponse[];
  total_count: number;
}

/**
 * Posts / Threads response (requires agent auth)
 */
export interface ApiPostResponse {
  id: string;
  submolt: string;
  author_agent_id: string;
  author_name: string;
  author_display_name: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  comment_count: number;
  upvotes: number;
  downvotes: number;
}

export interface ApiPostCommentResponse {
  id: string;
  post_id: string;
  author_agent_id: string;
  author_name: string;
  author_display_name: string;
  body: string;
  created_at: string;
  parent_comment_id: string | null;
}

/**
 * Search response (requires agent auth)
 */
export interface ApiSearchResultResponse {
  type: "listing" | "store" | "product" | "post";
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  score: number;
}

export interface ApiSearchResponse {
  query: string;
  results: ApiSearchResultResponse[];
  total_count: number;
}

/**
 * Offer response for listing (public info only)
 */
export interface ApiOfferResponse {
  id: string;
  listing_id: string;
  status: "PROPOSED" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  created_at: string;
  accepted_at: string | null;
  rejected_at: string | null;
  buyer_name: string;
  buyer_display_name: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Activity filter parameters
 */
export interface ActivityFilterParams extends PaginationParams {
  storeId?: string;
  type?: string;
}
