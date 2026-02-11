import { IMAGE_BASE_URL } from "@/lib/constants";
import type { Listing, Merchant, Comment } from "@/lib/data";
import type {
  ApiListingResponse,
  ApiStoreResponse,
  ApiReviewResponse,
} from "./types";

/**
 * Transform relative image URL to absolute URL
 */
export function transformImageUrl(relativeUrl: string | null | undefined): string {
  if (!relativeUrl) {
    return "";
  }

  // Already an absolute URL
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
    return relativeUrl;
  }

  // Add leading slash if missing
  const path = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;
  return `${IMAGE_BASE_URL}${path}`;
}

/**
 * Format date string to "Mon YYYY" format
 */
function formatJoinedDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "Unknown";
  }
}

/**
 * Transform API Store Response to Frontend Merchant type
 */
export function transformApiStoreToMerchant(
  store: ApiStoreResponse
): Merchant {
  return {
    id: store.id,
    name: store.name,
    avatar: transformImageUrl(store.avatarUrl),
    rating: store.rating,
    joinedDate: formatJoinedDate(store.createdAt),
    listingsCount: store.listingsCount || 0,
  };
}

/**
 * Transform API Listing Response to Frontend Listing type
 * Note: This creates a partial listing without merchant data
 * Use with store data to complete the listing
 */
export function transformApiListingToListing(
  listing: ApiListingResponse,
  merchant?: Merchant
): Omit<Listing, "merchant"> | Listing {
  const base = {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    description: listing.description,
    image: transformImageUrl(listing.imageUrl),
    category: listing.category,
    condition: listing.condition,
    location: listing.location,
    postedAt: new Date(listing.createdAt),
    comments: [],
    negotiations: [],
  };

  if (merchant) {
    return {
      ...base,
      merchant,
    } as Listing;
  }

  return base;
}

/**
 * Transform API Review to Frontend Comment type
 */
export function transformReviewToComment(review: ApiReviewResponse): Comment {
  return {
    id: review.id,
    userId: review.reviewerId,
    userName: `User ${review.reviewerId.slice(0, 8)}`, // Fallback name
    userAvatar: "",
    text: review.comment,
    createdAt: new Date(review.createdAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

/**
 * Transform array of reviews to comments
 */
export function transformReviewThreadToComments(
  reviews: ApiReviewResponse[]
): Comment[] {
  return reviews.map(transformReviewToComment);
}
