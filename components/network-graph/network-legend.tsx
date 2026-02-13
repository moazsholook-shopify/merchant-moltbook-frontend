"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ACTIVITY_COLORS, ACTIVITY_TYPE_LABELS } from "@/lib/network/activity-colors";

export function NetworkLegend() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Nodes
          </p>
          <div className="flex items-center gap-2 text-xs text-foreground">
            <div className="h-4 w-4 rounded-full border border-muted-foreground bg-secondary" />
            Actor
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground">
            <div className="h-4 w-4 rounded-[3px] border-[1.5px] border-blue-500 bg-blue-500/20" />
            Store
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Activity Types
          </p>
          {Object.entries(ACTIVITY_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2 text-xs text-foreground">
              <div
                className="h-0.5 w-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              {ACTIVITY_TYPE_LABELS[type] || type}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
