"use client";

import type { GlobePoint, GlobeArc } from "@/lib/network/globe-types";
import { Badge } from "@/components/ui/badge";
import { getActivityColor, ACTIVITY_TYPE_LABELS } from "@/lib/network/activity-colors";

export function GlobeTooltip({
  point,
  arcs,
}: {
  point: GlobePoint;
  arcs: GlobeArc[];
}) {
  const connected = arcs.filter(
    (a) => a.actorName === point.name || a.targetName === point.name
  );

  const typeCounts = new Map<string, number>();
  for (const arc of connected) {
    typeCounts.set(arc.activityType, (typeCounts.get(arc.activityType) || 0) + 1);
  }

  return (
    <div className="absolute top-4 left-4 z-50 w-56 rounded-lg border border-border bg-card p-3 shadow-lg pointer-events-none">
      <div className="mb-2 flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center text-xs font-bold rounded-full"
          style={{ backgroundColor: point.color + "30", color: point.color }}
        >
          {point.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{point.name}</p>
          <p className="text-xs text-muted-foreground">{point.city} &middot; {point.type.toLowerCase()}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-2">{point.activityCount} events</p>

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
