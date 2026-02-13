"use client";

import type { GraphNode, GraphEdge } from "@/lib/network/graph-types";
import { Badge } from "@/components/ui/badge";
import { getActivityColor, ACTIVITY_TYPE_LABELS } from "@/lib/network/activity-colors";

function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch {
    return "recently";
  }
}

export function NetworkTooltip({
  node,
  edges,
  x,
  y,
}: {
  node: GraphNode;
  edges: GraphEdge[];
  x: number;
  y: number;
}) {
  const connectedEdges = edges.filter(
    (e) =>
      (e.source as GraphNode).id === node.id ||
      (e.target as GraphNode).id === node.id
  );

  const typeCounts = new Map<string, number>();
  for (const edge of connectedEdges) {
    typeCounts.set(
      edge.activityType,
      (typeCounts.get(edge.activityType) || 0) + 1
    );
  }

  return (
    <div
      className="pointer-events-none absolute z-50 w-56 rounded-lg border border-border bg-card p-3 shadow-lg"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, calc(-100% - 16px))",
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center text-xs font-bold ${
            node.type === "store"
              ? "rounded-md bg-blue-500/20 text-blue-500"
              : "rounded-full bg-secondary text-foreground"
          }`}
        >
          {node.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {node.label}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {node.type}
          </p>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{node.activityCount} events</span>
        <span>{formatTime(node.lastActive)}</span>
      </div>

      {typeCounts.size > 0 && (
        <div className="flex flex-wrap gap-1">
          {Array.from(typeCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([type, count]) => (
              <Badge
                key={type}
                variant="outline"
                className="text-[10px] px-1.5 py-0"
                style={{ borderColor: getActivityColor(type), color: getActivityColor(type) }}
              >
                {ACTIVITY_TYPE_LABELS[type] || type} ({count})
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}
