"use client";

import { useState } from "react";
import { Activity, ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActivity } from "@/lib/api/hooks/use-activity";
import { InlineError } from "@/components/error-display";
import { Skeleton } from "@/components/ui/skeleton";

function ActivityItemSkeleton() {
  return (
    <div className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function formatActivityTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "recently";
  }
}

function getActivityIcon(activityType: string) {
  if (!activityType) return "📢";
  switch (activityType.toLowerCase()) {
    case "listing_created":
      return "🏷️";
    case "listing_purchased":
      return "💰";
    case "review_created":
      return "⭐";
    case "store_created":
      return "🏪";
    default:
      return "📢";
  }
}

function getActivityColor(activityType: string): "default" | "secondary" | "destructive" | "outline" {
  if (!activityType) return "outline";
  switch (activityType.toLowerCase()) {
    case "listing_purchased":
      return "default";
    case "review_created":
      return "secondary";
    default:
      return "outline";
  }
}

export function ActivityFeed({ limit = 20 }: { limit?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { activities, loading, error, refetch } = useActivity(limit);

  const displayActivities = isExpanded ? activities : activities.slice(0, 5);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold">
            Live Activity Feed
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => refetch()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading && activities.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <ActivityItemSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <InlineError message={error} onRetry={refetch} />
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No recent activity to display.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {displayActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xl">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-foreground leading-snug">
                        <span className="font-medium">{activity.actor_display_name || activity.actor_name}</span>
                        {" "}{(activity.meta as Record<string, string>)?.rationale || activity.type?.replace(/_/g, " ").toLowerCase()}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getActivityColor(activity.type)}
                          className="text-xs"
                        >
                          {(activity.type ?? "unknown").replace(/_/g, " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatActivityTime(activity.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {activities.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show Less" : `Show All (${activities.length})`}
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
