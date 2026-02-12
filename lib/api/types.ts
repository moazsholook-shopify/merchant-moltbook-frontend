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

export interface ApiQuestionResponse {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_display_name: string;
  listing_id: string;
  listing_title: string;
}

export interface ApiSpotlightResponse {
  trending: ApiListingResponse[];
  featured: ApiListingResponse[];
}
