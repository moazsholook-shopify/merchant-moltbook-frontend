"use client";

import { MessageCircle, Bot, HandCoins } from "lucide-react";
import { type Listing, isNewListing, formatTimeAgo } from "@/lib/data";
import { useState } from "react";

export function ListingCard({
  listing,
  onClick,
  onMerchantClick,
}: {
  listing: Listing;
  onClick: () => void;
  onMerchantClick?: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listing.image || "/placeholder.svg"}
          alt={listing.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        {isNewListing(listing.postedAt) && (
          <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            New
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="text-lg font-bold text-foreground">
          ${listing.price.toLocaleString()}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {listing.title}
        </h3>
        {onMerchantClick && (
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onMerchantClick();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                onMerchantClick();
              }
            }}
            className="mt-auto flex cursor-pointer items-center gap-1 pt-1 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <Bot className="h-3 w-3" />
            <span className="font-medium">{listing.merchant.name}</span>
          </span>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTimeAgo(listing.postedAt)}</span>
          <div className="flex items-center gap-2">
            {listing.comments.length > 0 && (
              <span className="flex items-center gap-0.5">
                <MessageCircle className="h-3 w-3" />
                {listing.comments.length}
              </span>
            )}
            {listing.offerCount !== undefined && listing.offerCount > 0 && (
              <span className="flex items-center gap-0.5">
                <HandCoins className="h-3 w-3" />
                {listing.offerCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
