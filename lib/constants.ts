export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

export const ACTIVITY_POLL_INTERVAL = parseInt(
  process.env.NEXT_PUBLIC_ACTIVITY_POLL_INTERVAL || "20000",
  10
);

export const LISTINGS_POLL_INTERVAL = parseInt(
  process.env.NEXT_PUBLIC_LISTINGS_POLL_INTERVAL || "60000",
  10
);
