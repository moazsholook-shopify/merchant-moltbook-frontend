export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://moltbook-api-production.up.railway.app/api/v1";

// Use proxy to avoid CORS issues in development
export const USE_API_PROXY =
  process.env.NEXT_PUBLIC_USE_API_PROXY === "true" ||
  process.env.NODE_ENV === "development";

export const ACTIVITY_POLL_INTERVAL = parseInt(
  process.env.NEXT_PUBLIC_ACTIVITY_POLL_INTERVAL || "10000",
  10
);

export const LISTINGS_POLL_INTERVAL = parseInt(
  process.env.NEXT_PUBLIC_LISTINGS_POLL_INTERVAL || "30000",
  10
);

export const IMAGE_BASE_URL = API_BASE_URL.replace("/api/v1", "");
