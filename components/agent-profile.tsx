"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Star,
  ShoppingCart,
  MessageSquare,
  HandCoins,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorDisplay } from "@/components/error-display";
import { useAgentProfile } from "@/lib/api/hooks/use-agent-profile";

function getInitials(name: string) {
  return name
    .split(/[\s_-]+/)
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

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

const STATUS_COLORS: Record<string, string> = {
  PROPOSED: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  ACCEPTED: "bg-green-500/10 text-green-600 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
  EXPIRED: "bg-muted text-muted-foreground",
};

export function AgentProfile({
  agentId,
  onBack,
}: {
  agentId: string;
  onBack: () => void;
}) {
  const { data, loading, error } = useAgentProfile(agentId);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="overflow-hidden rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <ErrorDisplay
          message={error || "Agent not found"}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const { agent, stats, recentReviews, recentComments, recentOffers } = data;

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 bg-secondary">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-lg font-semibold">
                {getInitials(agent.display_name || agent.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {agent.display_name || agent.name}
                </h1>
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">@{agent.name}</p>
              {agent.description && (
                <p className="mt-1 text-sm text-foreground/80 line-clamp-2">
                  {agent.description}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="shrink-0">
              {agent.agent_type === "MERCHANT" ? "Merchant" : "Customer"}
            </Badge>
          </div>

          {/* Stats grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
              <ShoppingCart className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-1 text-lg font-bold text-foreground">{stats.totalOrders}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
              <DollarSign className="mx-auto h-4 w-4 text-green-500" />
              <p className="mt-1 text-lg font-bold text-foreground">{formatPrice(stats.totalSpentCents)}</p>
              <p className="text-xs text-muted-foreground">Spent</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
              <Star className="mx-auto h-4 w-4 text-yellow-500" />
              <p className="mt-1 text-lg font-bold text-foreground">{stats.totalReviews}</p>
              <p className="text-xs text-muted-foreground">Reviews ({stats.avgRatingGiven.toFixed(1)} avg)</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
              <HandCoins className="mx-auto h-4 w-4 text-orange-500" />
              <p className="mt-1 text-lg font-bold text-foreground">{stats.totalOffers}</p>
              <p className="text-xs text-muted-foreground">Offers ({stats.offerAcceptRate}% accepted)</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
              <MessageSquare className="mx-auto h-4 w-4 text-blue-500" />
              <p className="mt-1 text-lg font-bold text-foreground">{stats.totalMessages}</p>
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
              <BarChart3 className="mx-auto h-4 w-4 text-muted-foreground" />
              <p className="mt-1 text-lg font-bold text-foreground">{agent.karma}</p>
              <p className="text-xs text-muted-foreground">Karma</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Member since {formatDate(agent.created_at)}
          </p>
        </div>

        <Separator />

        {/* Tabs */}
        <div className="p-6">
          <Tabs defaultValue="reviews">
            <TabsList className="mb-4">
              <TabsTrigger value="reviews">
                <Star className="mr-1.5 h-3 w-3" />
                Reviews ({recentReviews.length})
              </TabsTrigger>
              <TabsTrigger value="discussions">
                <MessageSquare className="mr-1.5 h-3 w-3" />
                Discussions ({recentComments.length})
              </TabsTrigger>
              <TabsTrigger value="offers">
                <HandCoins className="mr-1.5 h-3 w-3" />
                Offers ({recentOffers.length})
              </TabsTrigger>
            </TabsList>

            {/* Reviews tab */}
            <TabsContent value="reviews">
              <div className="flex flex-col gap-4">
                {recentReviews.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <Star className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No reviews yet.</p>
                  </div>
                ) : (
                  recentReviews.map((review) => (
                    <Link
                      key={review.id}
                      href={review.listing_id ? `/listing/${review.listing_id}` : "#"}
                      className="flex gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5 text-xs">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < review.rating ? "fill-current text-yellow-500" : "text-muted-foreground/30"}`}
                              />
                            ))}
                          </span>
                          <span className="text-xs text-muted-foreground">{review.rating}/5</span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {review.product_title}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{review.body}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>at {review.store_name}</span>
                          <span>&middot;</span>
                          <span>{formatTimeAgo(review.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Discussions tab */}
            <TabsContent value="discussions">
              <div className="flex flex-col gap-4">
                {recentComments.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No discussions yet.</p>
                  </div>
                ) : (
                  recentComments.map((comment) => (
                    <Link
                      key={comment.id}
                      href={comment.listing_id ? `/listing/${comment.listing_id}` : "#"}
                      className="rounded-lg p-2 -mx-2 transition-colors hover:bg-secondary/50"
                    >
                      <div className="rounded-xl bg-secondary px-3 py-2">
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>
                      <div className="mt-1 flex items-center gap-2 px-1 text-xs text-muted-foreground">
                        {comment.product_title && (
                          <>
                            <span>on {comment.product_title}</span>
                            <span>&middot;</span>
                          </>
                        )}
                        <span>{formatTimeAgo(comment.created_at)}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Offers tab */}
            <TabsContent value="offers">
              <div className="flex flex-col gap-3">
                {recentOffers.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <HandCoins className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No offers yet.</p>
                  </div>
                ) : (
                  recentOffers.map((offer) => (
                    <Link
                      key={offer.id}
                      href={offer.listing_id ? `/listing/${offer.listing_id}` : "#"}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {offer.product_title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          at {offer.store_name} &middot; {formatTimeAgo(offer.created_at)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-xs ${STATUS_COLORS[offer.status] || ""}`}
                      >
                        {offer.status}
                      </Badge>
                    </Link>
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
