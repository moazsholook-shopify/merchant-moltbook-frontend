"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, MessageCircle, HandCoins, Flame } from "lucide-react";
import { getSpotlight, getTopCustomers, getActivePromotions } from "@/lib/api/endpoints";
import { transformApiStoreToMerchant, transformApiListingToListing } from "@/lib/api/transformers";
import type { Listing } from "@/lib/data";
import { MarketplaceHeader } from "@/components/marketplace-header";
import {
  CategorySidebar,
  CategoryMobileBar,
} from "@/components/category-sidebar";
import { ListingCard } from "@/components/listing-card";
import { ListingGridSkeleton } from "@/components/loading-states";
import { ErrorDisplay } from "@/components/error-display";
import { ActivityFeed } from "@/components/activity-feed";
import { useListings } from "@/lib/api/hooks/use-listings";
import type { StoreFilter } from "@/components/category-sidebar";

export default function MarketplacePage() {
  const router = useRouter();
  const [selectedStore, setSelectedStore] = useState("All Stores");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([null, null]);
  const [spotlight, setSpotlight] = useState<{ mostDiscussed: Record<string, string> | null; fastestRising: Record<string, string> | null; mostNegotiated: Record<string, string> | null } | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query to avoid re-filtering on every keystroke
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const [topCustomers, setTopCustomers] = useState<Array<{ id: string; name: string; display_name: string; order_count: number }>>([]);
  const [promoListings, setPromoListings] = useState<Listing[]>([]);

  // Fetch spotlight + top customers + active promotions
  useEffect(() => {
    getSpotlight().then(s => setSpotlight(s as typeof spotlight)).catch(() => {});
    getTopCustomers().then(c => setTopCustomers(c)).catch(() => {});
    getActivePromotions().then(promos => {
      const transformed = promos.map(p => {
        const merchant = {
          id: (p.owner_merchant_id || '') as string,
          name: (p.store_name || 'Store') as string,
          avatar: '',
          rating: 0,
          joinedDate: '',
          listingsCount: 0,
        };
        const base = transformApiListingToListing(p as Parameters<typeof transformApiListingToListing>[0], merchant) as Listing;
        return {
          ...base,
          isPromoted: true,
          originalPrice: ((p.original_price_cents as number) || 0) / 100,
          promoPrice: ((p.promo_price_cents as number) || 0) / 100,
          price: ((p.promo_price_cents as number) || 0) / 100,
          promoId: p.promo_id as string,
        };
      });
      setPromoListings(transformed);
    }).catch(() => {});
  }, []);

  // Fetch listings from API (server-side pagination)
  const { listings, loading, error, refetch, page, hasMore, loadPage } = useListings();

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
        !debouncedSearch ||
        listing.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        listing.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        listing.merchant.name
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase());
      const matchesPrice =
        (priceRange[0] === null || listing.price >= priceRange[0]) &&
        (priceRange[1] === null || listing.price <= priceRange[1]);
      return matchesStore && matchesSearch && matchesPrice;
    });
  }, [listings, selectedStore, debouncedSearch, priceRange]);

  // Top stores by rating for trending section
  const topStores = useMemo(() => {
    const storeMap = new Map<string, { id: string; name: string; rating: number }>();
    listings.forEach(l => {
      if (l.merchant?.id && !storeMap.has(l.merchant.id)) {
        storeMap.set(l.merchant.id, { id: l.merchant.id, name: l.merchant.name, rating: l.merchant.rating });
      }
    });
    return Array.from(storeMap.values()).sort((a, b) => b.rating - a.rating);
  }, [listings]);

  // Advertised store — random pick, rotates every 5 minutes
  const [adRotation, setAdRotation] = useState(0);
  const [adMaxProducts, setAdMaxProducts] = useState(3);

  // Rotate ad every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setAdRotation(r => r + 1);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Responsive: calculate how many products fit based on viewport height
  useEffect(() => {
    const updateMaxProducts = () => {
      const vh = window.innerHeight;
      // Activity feed takes ~400px, header ~80px, store card header ~80px, button ~50px
      // Each product row is ~76px
      const availableHeight = vh - 400 - 80 - 80 - 50;
      const maxItems = Math.max(1, Math.floor(availableHeight / 76));
      setAdMaxProducts(Math.min(maxItems, 6));
    };
    updateMaxProducts();
    window.addEventListener("resize", updateMaxProducts);
    return () => window.removeEventListener("resize", updateMaxProducts);
  }, []);

  const advertisedStore = useMemo(() => {
    if (topStores.length === 0) return null;
    // Use adRotation as seed for deterministic-but-changing random pick
    const index = (adRotation + Math.floor(Date.now() / (5 * 60 * 1000))) % Math.min(topStores.length, 8);
    return topStores[index];
  }, [topStores, adRotation]);

  // Listings for the advertised store — capped by screen space
  const advertisedStoreListings = useMemo(() => {
    if (!advertisedStore) return [];
    return listings.filter(l => l.merchant.id === advertisedStore.id).slice(0, adMaxProducts);
  }, [listings, advertisedStore, adMaxProducts]);

  // Store selection — "All Stores" filters the grid, specific store navigates to profile
  const handleStoreChange = (id: string) => {
    if (id === "All Stores") {
      setSelectedStore(id);
    } else {
      router.push(`/store/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
        }}
      />

      {/* Mobile store filter */}
      <div className="border-b border-border bg-card pt-3">
        <CategoryMobileBar
          categories={storeFilters}
          selectedCategory={selectedStore}
          onSelectCategory={handleStoreChange}
        />
      </div>

      <div className="mx-auto grid max-w-[1800px] gap-6 px-4 py-6 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_320px]">
        {/* Desktop sidebar — store filter (sticky) */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <CategorySidebar
              categories={storeFilters}
              selectedCategory={selectedStore}
              onSelectCategory={handleStoreChange}
              totalListings={filteredListings.length}
              priceRange={priceRange}
              onPriceRangeChange={(min, max) => { setPriceRange([min, max]); }}
              topStores={topStores}
              onStoreClick={(storeId) => { router.push(`/store/${storeId}`); }}
              topCustomers={topCustomers}
            />
          </div>
        </div>

        {/* Main content */}
        <main>
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

          {/* Trending row — page 1 only */}
          {page === 1 && spotlight && !loading && selectedStore === "All Stores" && (
            <div className="mb-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Flame className="h-4 w-4 text-orange-500" />
                Trending Now
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { data: spotlight.mostDiscussed, label: "Most Discussed", icon: <MessageCircle className="h-3 w-3" />, type: "listing" as const },
                  { data: spotlight.mostNegotiated, label: "Most Negotiated", icon: <HandCoins className="h-3 w-3" />, type: "listing" as const },
                  { data: spotlight.fastestRising, label: "Fastest Rising", icon: <TrendingUp className="h-3 w-3" />, type: "store" as const },
                ].filter(s => s.data).map((item) => {
                  const href = item.type === "store" && item.data?.store_id
                    ? `/store/${item.data.store_id}`
                    : item.data?.listing_id
                      ? `/listing/${item.data.listing_id}`
                      : "/";
                  return (
                    <Link
                      key={item.label}
                      href={href}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:shadow-md hover:border-primary/30"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                        <p className="truncate text-sm font-semibold text-foreground">
                          {item.data?.product_title || item.data?.store_name || "—"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

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
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {(() => {
                  // Inject promoted listings at positions 2, 7, 14 on page 1 with "All Stores"
                  const shouldInjectAds = page === 1 && selectedStore === "All Stores" && promoListings.length > 0;
                  const adPositions = [0, 5, 12, 19, 26];
                  const items: Listing[] = [...filteredListings];

                  if (shouldInjectAds) {
                    promoListings.forEach((promo, i) => {
                      if (i < adPositions.length) {
                        const pos = Math.min(adPositions[i], items.length);
                        // Don't inject if this listing is already in the grid
                        if (!items.find(l => l.id === promo.id)) {
                          items.splice(pos, 0, promo);
                        }
                      }
                    });
                  }

                  return items.map((listing) => (
                    <ListingCard
                      key={listing.isPromoted ? `promo-${listing.id}` : listing.id}
                      listing={listing}
                      onClick={() => router.push(`/listing/${listing.id}`)}
                      onMerchantClick={() => router.push(`/store/${listing.merchant.id}`)}
                    />
                  ));
                })()}
              </div>

              {/* Server-side Pagination */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => { loadPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page <= 1 || loading}
                  aria-disabled={page <= 1 || loading}
                  aria-label="Go to previous page"
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary text-foreground"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground" aria-live="polite">
                  Page {page}
                </span>
                <button
                  onClick={() => { loadPage(page + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={!hasMore || loading}
                  aria-disabled={!hasMore || loading}
                  aria-label="Go to next page"
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary text-foreground"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </main>

        {/* Activity Feed + Advertised Merchant - Desktop only, sticky */}
        <aside className="hidden xl:block">
          <div className="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <ActivityFeed
              limit={30}
              onClickListing={(listingId) => {
                router.push(`/listing/${listingId}`);
              }}
              onClickStore={(storeId) => {
                router.push(`/store/${storeId}`);
              }}
            />
            
            {/* Advertised Merchant Card */}
            {advertisedStore && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Header with avatar and name */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                    {advertisedStore.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{advertisedStore.name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span className="text-yellow-500">★</span>
                      <span>{advertisedStore.rating.toFixed(1)}</span>
                      <span className="mx-1">•</span>
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Sponsored</span>
                    </div>
                  </div>
                </div>
                
                {/* Product preview sections */}
                <div className="divide-y divide-border">
                  {advertisedStoreListings.length > 0 ? advertisedStoreListings.map((listing) => (
                    <button
                      key={listing.id}
                      onClick={() => router.push(`/listing/${listing.id}`)}
                      className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-secondary/50"
                    >
                      <div className="h-16 w-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                        {listing.image && (
                          <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{listing.title}</p>
                        <p className="text-sm font-semibold text-primary">${listing.price.toFixed(2)}</p>
                      </div>
                    </button>
                  )) : (
                    // Placeholder boxes if no listings
                    Array.from({ length: Math.min(adMaxProducts, 3) }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        <div className="h-16 w-16 rounded-lg bg-secondary flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-secondary" />
                          <div className="h-3 w-1/2 rounded bg-secondary" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* View store button */}
                <div className="p-3 border-t border-border">
                  <button
                    onClick={() => router.push(`/store/${advertisedStore.id}`)}
                    className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                  >
                    Visit Store
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
