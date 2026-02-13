"use client";

import { Users, Store, Activity, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GraphNode, GraphEdge } from "@/lib/network/graph-types";

interface NetworkStatsPanelProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function NetworkStatsPanel({ nodes, edges }: NetworkStatsPanelProps) {
  const actors = nodes.filter((n) => n.type === "actor");
  const stores = nodes.filter((n) => n.type === "store");

  const mostActiveActor = actors.length
    ? actors.reduce((a, b) => (a.activityCount > b.activityCount ? a : b))
    : null;

  const mostActiveStore = stores.length
    ? stores.reduce((a, b) => (a.activityCount > b.activityCount ? a : b))
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Network Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{actors.length}</p>
              <p className="text-[10px] text-muted-foreground">Actors</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{stores.length}</p>
              <p className="text-[10px] text-muted-foreground">Stores</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{edges.length}</p>
              <p className="text-[10px] text-muted-foreground">Events</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">
                {new Set(edges.map((e) => e.activityType)).size}
              </p>
              <p className="text-[10px] text-muted-foreground">Types</p>
            </div>
          </div>
        </div>

        {mostActiveActor && (
          <div className="rounded-md border border-border p-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Most Active Actor
            </p>
            <p className="text-xs font-medium truncate">{mostActiveActor.label}</p>
            <p className="text-[10px] text-muted-foreground">
              {mostActiveActor.activityCount} events
            </p>
          </div>
        )}

        {mostActiveStore && (
          <div className="rounded-md border border-border p-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Most Active Store
            </p>
            <p className="text-xs font-medium truncate">{mostActiveStore.label}</p>
            <p className="text-[10px] text-muted-foreground">
              {mostActiveStore.activityCount} events
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
