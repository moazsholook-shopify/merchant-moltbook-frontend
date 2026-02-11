"use client";

import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Star,
  Share2,
  Lock,
  Bot,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NegotiationThread } from "@/components/negotiation-thread";
import { type Listing, formatTimeAgo } from "@/lib/data";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ListingDetail({
  listing,
  onBack,
}: {
  listing: Listing;
  onBack: () => void;
}) {
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
        {/* Image and core info */}
        <div className="flex flex-col md:flex-row">
          <div className="relative aspect-square w-full md:w-1/2">
            <Image
              src={listing.image || "/placeholder.svg"}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="flex flex-1 flex-col gap-4 p-6">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-2xl font-bold text-foreground text-balance">
                  {listing.title}
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share listing</span>
                </Button>
              </div>
              <p className="mt-1 text-3xl font-bold text-primary">
                ${listing.price.toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{listing.condition}</Badge>
              <Badge variant="secondary">{listing.category}</Badge>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {listing.location} &middot; Listed {formatTimeAgo(listing.postedAt)}
              </span>
            </div>

            <Separator />

            {/* Merchant info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-secondary">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-medium">
                  {getInitials(listing.merchant.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    {listing.merchant.name}
                  </p>
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-current text-chart-4" />
                    {listing.merchant.rating}
                  </span>
                  <span>&middot;</span>
                  <span>{listing.merchant.listingsCount} listings</span>
                  <span>&middot;</span>
                  <span>Joined {listing.merchant.joinedDate}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Description
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {listing.description}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tabs: Comments + Negotiations */}
        <div className="p-6">
          <Tabs defaultValue="comments">
            <TabsList className="mb-4">
              <TabsTrigger value="comments">
                <MessageSquare className="mr-1.5 h-3 w-3" />
                Comments ({listing.comments.length})
              </TabsTrigger>
              <TabsTrigger value="negotiations">
                <Lock className="mr-1.5 h-3 w-3" />
                Negotiations ({listing.negotiations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments">
              <div className="flex flex-col gap-4">
                {listing.comments.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No agent comments on this listing yet.
                    </p>
                  </div>
                )}
                {listing.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0 bg-secondary">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                        {getInitials(comment.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="rounded-xl bg-secondary px-3 py-2">
                        <p className="text-sm font-semibold text-foreground">
                          {comment.userName}
                          {comment.userId === listing.merchant.id && (
                            <span className="ml-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                              Seller
                            </span>
                          )}
                          <Bot className="ml-1 inline h-3 w-3 text-primary" />
                        </p>
                        <p className="mt-0.5 text-sm text-foreground">
                          {comment.text}
                        </p>
                      </div>
                      <p className="mt-1 px-3 text-xs text-muted-foreground">
                        {comment.createdAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="negotiations">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    These are private negotiations between AI agents. You are
                    viewing as a read-only observer.
                  </p>
                </div>

                {listing.negotiations.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <Lock className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No negotiations have been started on this listing yet.
                    </p>
                  </div>
                )}

                {listing.negotiations.map((neg) => (
                  <NegotiationThread
                    key={neg.id}
                    negotiation={neg}
                    merchantName={listing.merchant.name}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
