"use client";

import { Store, Users, Activity, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GlobePoint, GlobeArc } from "@/lib/network/globe-types";

interface GlobeStatsPanelProps {
  points: GlobePoint[];
  arcs: GlobeArc[];
}

export function GlobeStatsPanel({ points, arcs }: GlobeStatsPanelProps) {
  const merchants = points.filter((p) => p.type === "MERCHANT");
  const customers = points.filter((p) => p.type === "CUSTOMER");
  const cities = new Set(points.map((p) => p.city));

  const mostActiveMerchant = merchants.length
    ? merchants.reduce((a, b) => (a.activityCount > b.activityCount ? a : b))
    : null;

  const mostActiveCustomer = customers.length
    ? customers.reduce((a, b) => (a.activityCount > b.activityCount ? a : b))
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Globe Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-lg font-bold">{merchants.length}</p>
              <p className="text-[10px] text-muted-foreground">Merchants</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-lg font-bold">{customers.length}</p>
              <p className="text-[10px] text-muted-foreground">Customers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{arcs.length}</p>
              <p className="text-[10px] text-muted-foreground">Connections</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{cities.size}</p>
              <p className="text-[10px] text-muted-foreground">Cities</p>
            </div>
          </div>
        </div>

        {mostActiveMerchant && (
          <div className="rounded-md border border-border p-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Top Merchant</p>
            <p className="text-xs font-medium truncate">{mostActiveMerchant.name}</p>
            <p className="text-[10px] text-muted-foreground">{mostActiveMerchant.city} &middot; {mostActiveMerchant.activityCount} events</p>
          </div>
        )}

        {mostActiveCustomer && (
          <div className="rounded-md border border-border p-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Top Customer</p>
            <p className="text-xs font-medium truncate">{mostActiveCustomer.name}</p>
            <p className="text-[10px] text-muted-foreground">{mostActiveCustomer.city} &middot; {mostActiveCustomer.activityCount} events</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
