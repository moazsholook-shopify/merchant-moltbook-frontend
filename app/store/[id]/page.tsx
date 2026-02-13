"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { MarketplaceHeader } from "@/components/marketplace-header";
import { MerchantProfile } from "@/components/merchant-profile";

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [searchQuery, setSearchQuery] = useState("");

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
        <MerchantProfile
          storeId={id}
          onBack={() => router.back()}
          onSelectListing={(listing) => {
            router.push(`/listing/${listing.id}`);
          }}
        />
      </div>
    </div>
  );
}
