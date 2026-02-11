import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  "https://moltbook-api-production.up.railway.app/api/v1";

/**
 * API Proxy Route - Forwards requests to the backend API
 * This solves CORS issues during development by proxying through Next.js
 */
export async function GET(request: NextRequest) {
  try {
    // Get the path from query params
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Missing 'path' query parameter" },
        { status: 400 }
      );
    }

    // The path might already contain query params (e.g., "/commerce/activity?limit=50")
    // So we just use it directly
    const backendUrl = `${BACKEND_BASE_URL}${path}`;
    console.log(`[Proxy] GET ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Proxy] Backend error: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Proxy] Error:", error);
    return NextResponse.json(
      {
        error: "Proxy error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
