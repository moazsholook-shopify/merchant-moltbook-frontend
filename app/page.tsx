"use client";

import { useState, useMemo } from "react";
import { MarketplaceHeader } from "@/components/marketplace-header";
import {
  CategorySidebar,
  CategoryMobileBar,
} from "@/components/category-sidebar";
import { ListingCard } from "@/components/listing-card";
import { ListingDetail } from "@/components/listing-detail";
import { listings, categories } from "@/lib/data";
import type { Listing } from "@/lib/data";

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

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
  }, [selectedCategory, searchQuery]);

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

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
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
        <main className="flex-1">
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
                <p className="text-sm text-muted-foreground">
                  {filteredListings.length}{" "}
                  {filteredListings.length === 1 ? "listing" : "listings"}
                </p>
              </div>

              {filteredListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="text-lg font-medium text-foreground">
                    No listings found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or category filter.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </div>
    </div>
  );
}
