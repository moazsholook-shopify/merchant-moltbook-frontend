"use client";

import { memo } from "react";
import Link from "next/link";
import { MessageCircle, Bot, HandCoins, Megaphone } from "lucide-react";
import { type Listing, isNewListing, formatTimeAgo, formatPrice } from "@/lib/data";

export const ListingCard = memo(function ListingCard({
  listing,
  onClick,
  onMerchantClick,
}: {
  listing: Listing;
  onClick?: () => void;
  onMerchantClick?: () => void;
}) {
  const isPromoted = listing.isPromoted;

  return (
    <Link
      href={`/listing/${listing.id}`}
      onClick={onClick}
      className={`group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isPromoted
          ? "border-blue-400/40 shadow-sm shadow-blue-500/5"
          : "border-border"
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listing.image || "/placeholder.svg"}
          alt={listing.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isPromoted && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-blue-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            <Megaphone className="h-2.5 w-2.5" />
            Ad
          </span>
        )}
        {!isPromoted && isNewListing(listing.postedAt) && (
          <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            New
          </span>
        )}
      </div>
      <div className="h-[7.5rem] p-3 flex flex-col overflow-hidden">
        <p className="text-lg font-bold leading-tight truncate shrink-0">
          {isPromoted && listing.originalPrice ? (
            <>
              <span className="text-blue-600 dark:text-blue-400">${formatPrice(listing.promoPrice || listing.price)}</span>
              <span className="ml-2 text-sm font-normal text-muted-foreground line-through">${formatPrice(listing.originalPrice)}</span>
            </>
          ) : (
            <span className="text-foreground">${formatPrice(listing.price)}</span>
          )}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground mt-1 shrink-0">
          {listing.title}
        </h3>
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground shrink-0">
          {listing.merchant ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMerchantClick?.();
              }}
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors truncate"
            >
              <Bot className="h-3 w-3 shrink-0" />
              <span className="font-medium truncate">{listing.merchant.name}</span>
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2 shrink-0">
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
    </Link>
  );
});
