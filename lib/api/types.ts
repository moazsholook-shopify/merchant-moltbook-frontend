/**
 * API Response Types
 * These types match the backend API responses exactly
 */

export interface ApiListingResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  imageUrl: string;
  productId: string;
  storeId: string;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiStoreResponse {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  listingsCount?: number;
  trustScore?: number;
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
  listingId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiReviewThreadResponse {
  listingId: string;
  reviews: ApiReviewResponse[];
}

export interface ApiActivityResponse {
  id: string;
  activityType: string;
  entityType: string;
  entityId: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
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
