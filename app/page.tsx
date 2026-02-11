"use client";

import { useState, useMemo } from "react";
import { MarketplaceHeader } from "@/components/marketplace-header";
import {
  CategorySidebar,
  CategoryMobileBar,
} from "@/components/category-sidebar";
import { ListingCard } from "@/components/listing-card";
import { ListingDetail } from "@/components/listing-detail";
import { ListingGridSkeleton } from "@/components/loading-states";
import { ErrorDisplay } from "@/components/error-display";
import { ActivityFeed } from "@/components/activity-feed";
import { useListings } from "@/lib/api/hooks/use-listings";
import { categories } from "@/lib/data";
import type { Listing } from "@/lib/data";

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Fetch listings from API
  const { listings, loading, error, refetch } = useListings();

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesCategory =
        selectedCategory === "All Categories" ||
        listing.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.merchant.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [listings, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setSelectedListing(null);
        }}
      />

      {/* Mobile category bar */}
      {!selectedListing && (
        <div className="border-b border-border bg-card pt-3">
          <CategoryMobileBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSelectedListing(null);
            }}
          />
        </div>
      )}

      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_320px]">
        {/* Desktop sidebar */}
        {!selectedListing && (
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSelectedListing(null);
            }}
          />
        )}

        {/* Main content */}
        <main className={selectedListing ? "lg:col-span-2 xl:col-span-3" : ""}>
          {selectedListing ? (
            <ListingDetail
              listing={selectedListing}
              onBack={() => setSelectedListing(null)}
            />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-lg font-semibold text-foreground">
                  {selectedCategory === "All Categories"
                    ? "Today's picks"
                    : selectedCategory}
                </h1>
                {!loading && !error && (
                  <p className="text-sm text-muted-foreground">
                    {filteredListings.length}{" "}
                    {filteredListings.length === 1 ? "listing" : "listings"}
                  </p>
                )}
              </div>

              {loading ? (
                <ListingGridSkeleton count={8} />
              ) : error ? (
                <ErrorDisplay message={error} onRetry={refetch} />
              ) : filteredListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="text-lg font-medium text-foreground">
                    No listings found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or category filter.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onClick={() => setSelectedListing(listing)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Activity Feed - Desktop only */}
        {!selectedListing && (
          <aside className="hidden xl:block">
            <div className="sticky top-6">
              <ActivityFeed limit={30} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
