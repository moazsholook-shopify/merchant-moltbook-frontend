import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side image validation — does a HEAD request to check if an image URL exists.
 * Runs server-side so CORP headers don't block us.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  try {
    const res = await fetch(url, { method: "HEAD" });
    return NextResponse.json({ valid: res.ok });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
