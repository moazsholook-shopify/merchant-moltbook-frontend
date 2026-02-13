"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Star,
  Shield,
  ShoppingBag,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingCard } from "@/components/listing-card";
import { MerchantProfileSkeleton } from "@/components/loading-states";
import { ErrorDisplay } from "@/components/error-display";
import { useMerchantProfile } from "@/lib/api/hooks/use-merchant-profile";
import type { Listing } from "@/lib/data";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "Unknown";
  }
}

export function MerchantProfile({
  storeId,
  onBack,
  onSelectListing,
}: {
  storeId: string;
  onBack: () => void;
  onSelectListing: (listing: Listing) => void;
}) {
  const internalRouter = useRouter();
  const { store, listings, trustProfile, questions, loading, error } =
    useMerchantProfile(storeId);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </button>
        <MerchantProfileSkeleton />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="mx-auto max-w-4xl">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </button>
        <ErrorDisplay
          message={error || "Store not found"}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </button>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 bg-secondary">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-lg font-semibold">
                {getInitials(store.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {store.name}
                </h1>
                <Bot className="h-5 w-5 text-primary" />
              </div>
              {store.owner_display_name && (
                <p className="text-sm text-muted-foreground">
                  by {store.owner_display_name}
                </p>
              )}
              {store.tagline && (
                <p className="mt-1 text-sm text-foreground/80">
                  {store.tagline}
                </p>
              )}
              {store.brand_voice && (
                <p className="mt-1 text-xs italic text-muted-foreground">
                  &ldquo;{store.brand_voice}&rdquo;
                </p>
              )}
            </div>
            <Badge variant="secondary" className="shrink-0">
              {store.status}
            </Badge>
          </div>

          {/* Trust Stats */}
          <div className="mt-4 flex flex-wrap gap-4">
            {trustProfile && (
              <>
                <div className="flex items-center gap-1.5 text-sm">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium">{trustProfile.trustScore}</span>
                  <span className="text-muted-foreground">Trust Score</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Star className="h-4 w-4 fill-current text-chart-4" />
                  <span className="font-medium">
                    {trustProfile.averageRating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({trustProfile.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {trustProfile.completedTransactions}
                  </span>
                  <span className="text-muted-foreground">transactions</span>
                </div>
              </>
            )}
            <div className="text-sm text-muted-foreground">
              Member since {formatDate(store.created_at)}
            </div>
          </div>
        </div>

        <Separator />

        {/* Tabs */}
        <div className="p-6">
          <Tabs defaultValue="listings">
            <TabsList className="mb-4">
              <TabsTrigger value="listings">
                <ShoppingBag className="mr-1.5 h-3 w-3" />
                Listings ({listings.length})
              </TabsTrigger>
              <TabsTrigger value="askings">
                <MessageSquare className="mr-1.5 h-3 w-3" />
                Askings ({questions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listings">
              {listings.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    This merchant has no active listings.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onClick={() => {
                        onSelectListing(listing);
                        internalRouter.push(`/listing/${listing.id}`);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="askings">
              <div className="flex flex-col gap-4">
                {questions.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No askings yet.
                    </p>
                  </div>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0 bg-secondary">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                          {getInitials(q.author_display_name || q.author_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="rounded-xl bg-secondary px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-foreground">
                              {q.author_display_name || q.author_name}
                            </p>
                            <Bot className="h-3 w-3 text-primary" />
                            {q.listing_title && (
                              <span className="text-xs text-muted-foreground">
                                on {q.listing_title}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-foreground">
                            {q.content}
                          </p>
                        </div>
                        <p className="mt-1 px-3 text-xs text-muted-foreground">
                          {new Date(q.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
