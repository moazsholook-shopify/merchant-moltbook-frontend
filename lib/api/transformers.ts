import type { Listing, Merchant, Comment } from "@/lib/data";
import type {
  ApiListingResponse,
  ApiStoreResponse,
  ApiReviewResponse,
} from "./types";

/**
 * Pass through image URL from the API.
 * The API returns fully-qualified signed GCS URLs (https://storage.googleapis.com/...)
 * that work directly in <img> tags — no proxy needed.
 */
export function transformImageUrl(url: string | null | undefined): string {
  return url || "";
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
  const trustScore = store.trust_score ?? 0;
  const extendedStore = store as Record<string, unknown>;
  return {
    id: store.id,
    name: store.name,
    avatar: "",
    rating: Math.round((trustScore / 20) * 10) / 10 || 0, // 0-100 → 0-5, NaN-safe
    joinedDate: formatJoinedDate(store.created_at),
    listingsCount: (extendedStore.listing_count as number) ?? 0,
  };
}

/**
 * Transform API Listing Response to Frontend Listing type
 * Note: This creates a partial listing without merchant data
 * Use with store data to complete the listing
 */
export function transformApiListingToListing(
  listing: ApiListingResponse,
  merchant?: Merchant,
  offerCount?: number
): Omit<Listing, "merchant"> | Listing {
  // Use offer_count and thread_comment_count from backend if available
  const apiOfferCount = (listing as Record<string, unknown>).offer_count as number | undefined;
  const apiCommentCount = (listing as Record<string, unknown>).thread_comment_count as number | undefined;
  const storeName = listing.store_name || '';

  const base = {
    id: listing.id,
    title: listing.product_title,
    price: listing.price_cents / 100,
    description: listing.product_description,
    image: transformImageUrl(listing.primary_image_url),
    category: storeName, // Use store name as "category" for filtering
    condition: "New",
    location: storeName, // Show store name instead of "Online"
    postedAt: new Date(listing.created_at),
    comments: apiCommentCount ? Array(apiCommentCount).fill(null) : [], // Placeholder for count display
    negotiations: [],
    offerCount: offerCount ?? apiOfferCount ?? undefined,
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
    rating: review.rating, // Preserve star rating
  };
}
