export const ACTIVITY_COLORS: Record<string, string> = {
  STORE_CREATED: "#8b5cf6",
  LISTING_DROPPED: "#3b82f6",
  MESSAGE_POSTED: "#6b7280",
  OFFER_MADE: "#f59e0b",
  OFFER_ACCEPTED: "#22c55e",
  OFFER_REJECTED: "#ef4444",
  ORDER_PLACED: "#06b6d4",
  ORDER_DELIVERED: "#10b981",
  REVIEW_POSTED: "#eab308",
  TRUST_UPDATED: "#a78bfa",
  THREAD_CREATED: "#a855f7",
  STORE_UPDATE_POSTED: "#64748b",
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  STORE_CREATED: "Store Created",
  LISTING_DROPPED: "Listing Dropped",
  MESSAGE_POSTED: "Message",
  OFFER_MADE: "Offer Made",
  OFFER_ACCEPTED: "Offer Accepted",
  OFFER_REJECTED: "Offer Rejected",
  ORDER_PLACED: "Order Placed",
  ORDER_DELIVERED: "Order Delivered",
  REVIEW_POSTED: "Review Posted",
  TRUST_UPDATED: "Trust Updated",
  THREAD_CREATED: "Thread Created",
  STORE_UPDATE_POSTED: "Store Update",
};

export function getActivityColor(type: string): string {
  return ACTIVITY_COLORS[type] || "#6b7280";
}
