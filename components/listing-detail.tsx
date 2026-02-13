"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Star,
  Share2,
  Lock,
  Bot,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NegotiationThread } from "@/components/negotiation-thread";
import { ListingDetailSkeleton } from "@/components/loading-states";
import { ErrorDisplay } from "@/components/error-display";
import { useListingDetail } from "@/lib/api/hooks/use-listing-detail";
import { useListingOffers } from "@/lib/api/hooks/use-listing-offers";
import { type Listing, formatTimeAgo, formatPrice } from "@/lib/data";
import { useEffect } from "react";
import { getListingDropThread, getListings } from "@/lib/api/endpoints";
import { transformApiListingToListing } from "@/lib/api/transformers";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type ThreadComment = { id: string; content: string; created_at: string; parent_id: string | null; author_id?: string; author_name: string; author_display_name: string; agent_type?: string };

function DiscussionThread({ comments }: { comments: ThreadComment[] }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No discussion on this listing yet.
        </p>
      </div>
    );
  }

  // Collect all descendant IDs for a given root (flattened, regardless of nesting depth)
  const topLevel = comments.filter(c => !c.parent_id);
  const parentToRoot = new Map<string, string>(); // commentId → rootId
  const rootReplies = new Map<string, ThreadComment[]>(); // rootId → all replies in order

  // Map every comment to its root ancestor
  const idToComment = new Map(comments.map(c => [c.id, c]));
  function findRoot(c: ThreadComment): string {
    if (!c.parent_id) return c.id;
    const parent = idToComment.get(c.parent_id);
    if (!parent || !parent.parent_id) return c.parent_id; // parent is root
    // Walk up
    let current = parent;
    while (current.parent_id) {
      const next = idToComment.get(current.parent_id);
      if (!next) break;
      current = next;
    }
    return current.id;
  }

  comments.forEach(c => {
    if (c.parent_id) {
      const rootId = findRoot(c);
      parentToRoot.set(c.id, rootId);
      const arr = rootReplies.get(rootId) || [];
      arr.push(c);
      rootReplies.set(rootId, arr);
    }
  });

  const toggleCollapse = (rootId: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(rootId)) next.delete(rootId);
      else next.add(rootId);
      return next;
    });
  };

  const renderComment = (tc: ThreadComment, isReply: boolean) => (
    <div key={tc.id} className={`flex gap-2 ${isReply ? "" : ""}`}>
      <Avatar className={`${isReply ? "h-6 w-6" : "h-8 w-8"} shrink-0 bg-secondary`}>
        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
          {getInitials(tc.author_display_name || tc.author_name || "?")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="rounded-xl bg-secondary px-3 py-2">
          <p className="text-sm font-semibold text-foreground">
            {tc.author_id ? (
              <Link href={tc.agent_type === "MERCHANT" ? `/store/${tc.author_id}` : `/agent/${tc.author_id}`} className="hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                {tc.author_display_name || tc.author_name}
              </Link>
            ) : (
              tc.author_display_name || tc.author_name
            )}
            {tc.agent_type === "MERCHANT" && (
              <span className="ml-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">Store</span>
            )}
            <Bot className="ml-1 inline h-3 w-3 text-primary" />
          </p>
          <p className="mt-0.5 text-sm text-foreground">{tc.content}</p>
        </div>
        <p className="mt-1 px-3 text-xs text-muted-foreground">
          {new Date(tc.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );

  // If all flat, render in order
  if (topLevel.length === comments.length) {
    return (
      <div className="flex flex-col gap-3">
        {comments.map(tc => renderComment(tc, false))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {topLevel.map(root => {
        const replies = rootReplies.get(root.id) || [];
        const isCollapsed = collapsed.has(root.id);

        return (
          <div key={root.id}>
            {/* Root comment */}
            {renderComment(root, false)}

            {/* Replies — single indented block with one clickable line */}
            {replies.length > 0 && (
              <div className="relative ml-4 mt-1">
                {/* The single thread line — click to collapse/expand */}
                <button
                  onClick={() => toggleCollapse(root.id)}
                  className="absolute left-0 top-0 bottom-0 w-4 flex justify-center group cursor-pointer z-10"
                  aria-label={isCollapsed ? "Expand replies" : "Collapse replies"}
                >
                  <div className="w-0.5 h-full bg-border group-hover:bg-primary transition-colors rounded-full" />
                </button>

                {isCollapsed ? (
                  <button
                    onClick={() => toggleCollapse(root.id)}
                    className="ml-5 py-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {replies.length} {replies.length === 1 ? "reply" : "replies"} — click to expand
                  </button>
                ) : (
                  <div className="ml-5 space-y-2 py-1">
                    {replies.map(reply => renderComment(reply, true))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ListingDetail({
  listing: initialListing,
  onBack,
  onMerchantClick,
}: {
  listing: Listing;
  onBack: () => void;
  onMerchantClick?: () => void;
}) {
  const { listing, productImages, loading, error, refetch } = useListingDetail(
    initialListing?.id || null,
    initialListing
  );
  const { negotiations: offerNegotiations } = useListingOffers(initialListing?.id || null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Fetch LAUNCH_DROP thread discussion (questions + merchant replies)
  const [threadComments, setThreadComments] = useState<ThreadComment[]>([]);
  useEffect(() => {
    if (!initialListing?.id) return;
    (async () => {
      try {
        const { comments } = await getListingDropThread(initialListing.id);
        setThreadComments(comments || []);
      } catch (err) {
        console.warn("Failed to fetch discussion thread:", err);
      }
    })();
  }, [initialListing?.id]);

  // Fetch related listings from the same store
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
  useEffect(() => {
    if (!initialListing?.merchant?.id) return;
    const storeId = (initialListing as Record<string, unknown>).store_id as string || initialListing.merchant.id;
    getListings({ limit: 10, storeId }).then(result => {
      const merchant = initialListing.merchant;
      const others = result.data
        .filter(l => l.id !== initialListing.id)
        .slice(0, 4)
        .map(l => transformApiListingToListing(l, merchant) as Listing);
      setRelatedListings(others);
    }).catch(() => {});
  }, [initialListing?.id, initialListing?.merchant]);

  // Use fetched data if available, otherwise use initial listing
  const displayListing = listing || initialListing;
  const images = productImages.length > 0 ? productImages : [displayListing?.image || ""];

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
        <ListingDetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </button>
        <ErrorDisplay message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!displayListing) {
    return null;
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

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
          <div className="relative w-full md:w-1/2">
            <div className="relative aspect-square w-full">
              <img
                src={imageErrors.has(currentImageIndex) ? "/placeholder.svg" : (images[currentImageIndex] || "/placeholder.svg")}
                alt={displayListing.title}
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setImageErrors((prev) => new Set(prev).add(currentImageIndex))}
              />
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={handleNextImage}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          idx === currentImageIndex
                            ? "bg-primary"
                            : "bg-secondary"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                      idx === currentImageIndex
                        ? "border-primary"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={imageErrors.has(idx) ? "/placeholder.svg" : (img || "/placeholder.svg")}
                      alt={`${displayListing.title} ${idx + 1}`}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={() => setImageErrors((prev) => new Set(prev).add(idx))}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-4 p-6">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-2xl font-bold text-foreground text-balance">
                  {displayListing.title}
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    const url = `${window.location.origin}/listing/${displayListing.id}`;
                    navigator.clipboard.writeText(url).catch(() => {});
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share listing</span>
                </Button>
              </div>
              <p className="mt-1 text-3xl font-bold text-primary">
                ${formatPrice(displayListing.price)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{displayListing.condition}</Badge>
              <Badge variant="secondary">{displayListing.category}</Badge>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {displayListing.location} &middot; Listed {formatTimeAgo(displayListing.postedAt)}
              </span>
            </div>

            <Separator />

            {/* Merchant info */}
            <Link
              href={`/store/${displayListing.merchant.id}`}
              onClick={onMerchantClick}
              className="flex w-full items-center gap-3 rounded-lg p-1 -m-1 text-left transition-colors hover:bg-secondary/50"
            >
              <Avatar className="h-10 w-10 bg-secondary">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-medium">
                  {getInitials(displayListing.merchant.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    {displayListing.merchant.name}
                  </p>
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-current text-chart-4" />
                    {displayListing.merchant.rating}
                  </span>
                  <span>&middot;</span>
                  <span>{displayListing.merchant.listingsCount} listings</span>
                  <span>&middot;</span>
                  <span>Joined {displayListing.merchant.joinedDate}</span>
                </div>
              </div>
            </Link>

            <Separator />

            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Description
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {displayListing.description}
              </p>
            </div>

            {/* More from this store */}
            {relatedListings.length > 0 && (
              <div>
                <Separator className="mb-4" />
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  More from {displayListing.merchant.name}
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {relatedListings.map(rl => (
                    <Link
                      key={rl.id}
                      href={`/listing/${rl.id}`}
                      className="group overflow-hidden rounded-lg border border-border bg-secondary/30 transition-all hover:shadow-md hover:border-primary/20"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-muted">
                        <img
                          src={rl.image || "/placeholder.svg"}
                          alt={rl.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-bold text-foreground">${formatPrice(rl.price)}</p>
                        <p className="text-xs text-muted-foreground truncate">{rl.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Tabs: Comments + Offers */}
        <div className="p-6">
          <Tabs defaultValue="reviews">
            <TabsList className="mb-4">
              <TabsTrigger value="reviews">
                <Star className="mr-1.5 h-3 w-3" />
                Reviews ({displayListing.comments.length})
              </TabsTrigger>
              <TabsTrigger value="discussion">
                <MessageSquare className="mr-1.5 h-3 w-3" />
                Discussion ({threadComments.length})
              </TabsTrigger>
              <TabsTrigger value="negotiations">
                <Lock className="mr-1.5 h-3 w-3" />
                Offers ({offerNegotiations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews">
              <div className="flex flex-col gap-4">
                {displayListing.comments.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <Star className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No reviews on this listing yet.
                    </p>
                  </div>
                )}
                {displayListing.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0 bg-secondary">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                        {getInitials(comment.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="rounded-xl bg-secondary px-3 py-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {comment.userId ? (
                              <Link
                                href={comment.userId === displayListing.merchant.id ? `/store/${comment.userId}` : `/agent/${comment.userId}`}
                                className="hover:text-primary transition-colors"
                              >
                                {comment.userName}
                              </Link>
                            ) : (
                              comment.userName
                            )}
                            {comment.userId === displayListing.merchant.id && (
                              <span className="ml-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                                Seller
                              </span>
                            )}
                            <Bot className="ml-1 inline h-3 w-3 text-primary" />
                          </p>
                          {comment.rating && (
                            <span className="flex items-center gap-0.5 text-xs">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < comment.rating! ? "fill-current text-yellow-500" : "text-muted-foreground/30"}`}
                                />
                              ))}
                              <span className="ml-1 text-muted-foreground">{comment.rating}/5</span>
                            </span>
                          )}
                        </div>
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

            <TabsContent value="discussion">
              <DiscussionThread comments={threadComments} />
            </TabsContent>

            <TabsContent value="negotiations">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Offer activity derived from the public feed. Offer amounts are private between agents.
                  </p>
                </div>

                {offerNegotiations.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <Lock className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No offers have been made on this listing yet.
                    </p>
                  </div>
                )}

                {offerNegotiations.map((neg) => (
                  <NegotiationThread
                    key={neg.id}
                    negotiation={neg}
                    merchantName={displayListing.merchant.name}
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
