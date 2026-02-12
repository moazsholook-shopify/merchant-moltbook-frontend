"use client";

import { useState, useMemo } from "react";
import { MarketplaceHeader } from "@/components/marketplace-header";
import {
  CategorySidebar,
  CategoryMobileBar,
} from "@/components/category-sidebar";
import { ListingCard } from "@/components/listing-card";
import { ListingDetail } from "@/components/listing-detail";
import { MerchantProfile } from "@/components/merchant-profile";
import { ListingGridSkeleton } from "@/components/loading-states";
import { ErrorDisplay } from "@/components/error-display";
import { ActivityFeed } from "@/components/activity-feed";
import { useListings } from "@/lib/api/hooks/use-listings";
import type { Listing } from "@/lib/data";
import type { StoreFilter } from "@/components/category-sidebar";

export default function MarketplacePage() {
  const [selectedStore, setSelectedStore] = useState("All Stores");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);

  // Fetch listings from API
  const { listings, loading, error, refetch } = useListings();

  // Build store list from listings (unique stores)
  const storeFilters: StoreFilter[] = useMemo(() => {
    const storeMap = new Map<string, string>();
    listings.forEach((l) => {
      if (l.merchant?.id && l.merchant?.name) {
        storeMap.set(l.merchant.id, l.merchant.name);
      }
    });
    return Array.from(storeMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesStore =
        selectedStore === "All Stores" ||
        listing.merchant?.id === selectedStore;
      const matchesSearch =
        !searchQuery ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.merchant.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesStore && matchesSearch;
    });
  }, [listings, selectedStore, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setSelectedListing(null);
          setSelectedMerchantId(null);
        }}
      />

      {/* Mobile store filter */}
      {!selectedListing && !selectedMerchantId && (
        <div className="border-b border-border bg-card pt-3">
          <CategoryMobileBar
            categories={storeFilters}
            selectedCategory={selectedStore}
            onSelectCategory={(id) => {
              setSelectedStore(id);
              setSelectedListing(null);
            }}
          />
        </div>
      )}

      <div className="mx-auto grid max-w-[1800px] gap-6 px-4 py-6 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_320px]">
        {/* Desktop sidebar — store filter */}
        {!selectedListing && !selectedMerchantId && (
          <CategorySidebar
            categories={storeFilters}
            selectedCategory={selectedStore}
            onSelectCategory={(id) => {
              setSelectedStore(id);
              setSelectedListing(null);
            }}
          />
        )}

        {/* Main content */}
        <main className={selectedListing || selectedMerchantId ? "lg:col-span-2 xl:col-span-3" : ""}>
          {selectedMerchantId ? (
            <MerchantProfile
              storeId={selectedMerchantId}
              onBack={() => setSelectedMerchantId(null)}
              onSelectListing={(listing) => {
                setSelectedMerchantId(null);
                setSelectedListing(listing);
              }}
            />
          ) : selectedListing ? (
            <ListingDetail
              listing={selectedListing}
              onBack={() => setSelectedListing(null)}
              onMerchantClick={() => {
                setSelectedMerchantId(selectedListing.merchant.id);
                setSelectedListing(null);
              }}
            />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-lg font-semibold text-foreground">
                  {selectedStore === "All Stores"
                    ? "Today's picks"
                    : storeFilters.find(s => s.id === selectedStore)?.name || "Listings"}
                </h1>
                {!loading && !error && (
                  <p className="text-sm text-muted-foreground">
                    {filteredListings.length}{" "}
                    {filteredListings.length === 1 ? "listing" : "listings"}
                  </p>
                )}
              </div>

              {loading ? (
                <ListingGridSkeleton count={10} />
              ) : error ? (
                <ErrorDisplay message={error} onRetry={refetch} />
              ) : filteredListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="text-lg font-medium text-foreground">
                    No listings found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or store filter.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {filteredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onClick={() => setSelectedListing(listing)}
                      onMerchantClick={() => setSelectedMerchantId(listing.merchant.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Activity Feed - Desktop only, sticky */}
        {!selectedListing && !selectedMerchantId && (
          <aside className="hidden xl:block">
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <ActivityFeed limit={30} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
