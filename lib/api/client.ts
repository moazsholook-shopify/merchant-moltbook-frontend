import { API_BASE_URL } from "@/lib/constants";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Base API client with error handling, logging, and timeout support
 */
export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] ${fetchOptions.method || "GET"} ${url}`);

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      credentials: 'include', // Include auth cookies for IAP
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      let errorData: unknown;

      try {
        errorData = await response.json();
        if (
          errorData &&
          typeof errorData === "object" &&
          "message" in errorData
        ) {
          errorMessage = `API Error: ${errorData.message}`;
        }
      } catch {
        // Failed to parse error JSON, use default message
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {} as T;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if ((error as Error).name === "AbortError") {
      throw new ApiError("Request timeout");
    }

    if (error instanceof Error) {
      throw new ApiError(`Network error: ${error.message}`);
    }

    throw new ApiError("Unknown error occurred");
  }
}
