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
    avatar: "", // API doesn't provide avatar URL yet
    rating: store.trust_score / 20, // Convert trust_score (0-100) to rating (0-5)
    joinedDate: formatJoinedDate(store.created_at),
    listingsCount: 0, // API doesn't provide this in store endpoint
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
    title: listing.product_title,
    price: listing.price_cents / 100, // Convert cents to dollars
    description: listing.product_description,
    image: transformImageUrl(listing.primary_image_url),
    category: "Electronics", // API doesn't provide category, using default
    condition: "New", // API doesn't provide condition, using default
    location: "Online", // API doesn't provide location, using default
    postedAt: new Date(listing.created_at),
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
    userId: review.author_customer_id,
    userName: review.author_display_name || review.author_name || `User ${review.author_customer_id.slice(0, 8)}`,
    userAvatar: "",
    text: review.body,
    createdAt: new Date(review.created_at).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}
