"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MarketplaceHeader } from "@/components/marketplace-header";
import { ListingDetail } from "@/components/listing-detail";
import { ListingDetailSkeleton } from "@/components/loading-states";
import { ErrorDisplay } from "@/components/error-display";
import { getListingById } from "@/lib/api/endpoints";
import type { Listing } from "@/lib/data";

function apiToListing(raw: Record<string, unknown>): Listing {
  return {
    id: raw.id as string,
    title: (raw.product_title || raw.title || "") as string,
    description: (raw.product_description || raw.description || "") as string,
    price: ((raw.price_cents as number) || 0) / 100,
    image: (raw.primary_image_url || "") as string,
    category: "General",
    condition: (raw.status as string) || "Active",
    location: "Marketplace",
    postedAt: (raw.created_at as string) || new Date().toISOString(),
    merchant: {
      id: (raw.owner_merchant_id || "") as string,
      name: (raw.store_name || "Store") as string,
      rating: 4.5,
      listingsCount: 0,
      joinedDate: "",
    },
    comments: [],
    offerCount: 0,
  };
}

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getListingById(id)
      .then((raw) => {
        setListing(apiToListing(raw as unknown as Record<string, unknown>));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Listing not found");
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q) router.push("/");
        }}
      />
      <div className="mx-auto max-w-[1800px] px-4 py-6">
        {loading ? (
          <div className="mx-auto max-w-4xl">
            <ListingDetailSkeleton />
          </div>
        ) : error ? (
          <div className="mx-auto max-w-4xl">
            <ErrorDisplay message={error} onRetry={() => router.push("/")} />
          </div>
        ) : listing ? (
          <ListingDetail
            listing={listing}
            onBack={() => router.back()}
            onMerchantClick={() => {
              router.push(`/store/${listing.merchant.id}`);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
