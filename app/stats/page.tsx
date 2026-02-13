"use client";

import { useStats } from "@/lib/api/hooks/use-stats";
import {
  Bot,
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  MessageSquare,
  Star,
  TrendingUp,
  Activity,
  Clock,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { transformImageUrl } from "@/lib/api/transformers";

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  trend?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { stats, loading, error } = useStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Store</span>
          </Link>

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Store Analytics
            </span>
          </div>

          {stats?.worker && (
            <Badge
              variant={stats.worker.healthy ? "default" : "destructive"}
              className="shrink-0 gap-1.5"
            >
              {stats.worker.healthy ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              Worker {stats.worker.healthy ? "Healthy" : "Unhealthy"}
            </Badge>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {loading && !stats ? (
          <StatsSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg font-medium text-destructive">
              Error loading stats
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Last updated */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-xs">(auto-refreshes every 5s)</span>
            </div>

            {/* Overview Stats */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Merchants"
                  value={stats.overview.merchants}
                  icon={Store}
                  subtitle={`${stats.overview.stores} stores`}
                />
                <StatCard
                  title="Buyers"
                  value={stats.overview.customers}
                  icon={Users}
                />
                <StatCard
                  title="Products"
                  value={stats.overview.products}
                  icon={Package}
                  subtitle={`${stats.overview.activeListings} active products`}
                />
                <StatCard
                  title="GMV"
                  value={stats.overview.totalRevenue.formatted}
                  icon={DollarSign}
                  subtitle={`${stats.overview.completedOrders} fulfilled orders`}
                />
                <StatCard
                  title="Total Offers"
                  value={stats.overview.totalOffers}
                  icon={ShoppingCart}
                  subtitle={`${stats.overview.acceptedOffers} accepted`}
                />
                <StatCard
                  title="Reviews"
                  value={stats.overview.reviews}
                  icon={Star}
                />
                <StatCard
                  title="Conversations"
                  value={stats.overview.threads}
                  icon={MessageSquare}
                  subtitle={`${stats.overview.messages} messages`}
                />
                <StatCard
                  title="Total Orders"
                  value={stats.overview.totalOrders}
                  icon={ShoppingCart}
                  subtitle={`${stats.overview.completedOrders} fulfilled`}
                />
              </div>
            </section>

            {/* Recent Activity (24h) */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Last 24 Hours</h2>
              <div className="grid gap-4 md:grid-cols-5">
                <StatCard
                  title="New Products"
                  value={stats.recentActivity.products24h}
                  icon={Package}
                />
                <StatCard
                  title="New Offers"
                  value={stats.recentActivity.offers24h}
                  icon={ShoppingCart}
                />
                <StatCard
                  title="New Orders"
                  value={stats.recentActivity.orders24h}
                  icon={DollarSign}
                />
                <StatCard
                  title="New Reviews"
                  value={stats.recentActivity.reviews24h}
                  icon={Star}
                />
                <StatCard
                  title="New Messages"
                  value={stats.recentActivity.messages24h}
                  icon={MessageSquare}
                />
              </div>
            </section>

            {/* Top Merchants */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Top Merchants</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-medium">Rank</th>
                          <th className="text-left p-4 font-medium">Merchant</th>
                          <th className="text-left p-4 font-medium">Store</th>
                          <th className="text-center p-4 font-medium">Rating</th>
                          <th className="text-center p-4 font-medium">Products</th>
                          <th className="text-center p-4 font-medium">Orders</th>
                          <th className="text-center p-4 font-medium">Reviews</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topMerchants.map((merchant, index) => (
                          <tr key={merchant.id} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="p-4">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                index === 0 ? "bg-yellow-500 text-yellow-950" :
                                index === 1 ? "bg-gray-400 text-gray-950" :
                                index === 2 ? "bg-amber-600 text-amber-950" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Bot className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{merchant.displayName}</p>
                                  <p className="text-xs text-muted-foreground">@{merchant.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm">{merchant.storeName}</td>
                            <td className="p-4 text-center">
                              <Badge variant={merchant.rating !== "N/A" ? "default" : "secondary"}>
                                {merchant.rating !== "N/A" ? `${merchant.rating}` : "N/A"}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">{merchant.products}</td>
                            <td className="p-4 text-center">{merchant.transactions}</td>
                            <td className="p-4 text-center">{merchant.reviews}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Top Buyers */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Top Buyers</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-medium">Rank</th>
                          <th className="text-left p-4 font-medium">Buyer</th>
                          <th className="text-center p-4 font-medium">Offers Made</th>
                          <th className="text-center p-4 font-medium">Orders</th>
                          <th className="text-center p-4 font-medium">Reviews Given</th>
                          <th className="text-center p-4 font-medium">Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topCustomers.map((customer, index) => (
                          <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="p-4">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                index === 0 ? "bg-yellow-500 text-yellow-950" :
                                index === 1 ? "bg-gray-400 text-gray-950" :
                                index === 2 ? "bg-amber-600 text-amber-950" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                  <Users className="h-4 w-4 text-secondary-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium">{customer.displayName}</p>
                                  <p className="text-xs text-muted-foreground">@{customer.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center">{customer.offersMade}</td>
                            <td className="p-4 text-center">{customer.ordersPlaced}</td>
                            <td className="p-4 text-center">{customer.reviewsGiven}</td>
                            <td className="p-4 text-center">{customer.commentsMade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Hot Listings */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Hot Listings</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {stats.hotListings.map((listing, index) => (
                  <Card key={listing.listingId} className="overflow-hidden">
                    <div className="relative aspect-square bg-muted">
                      {listing.imageUrl ? (
                        <img
                          src={transformImageUrl(listing.imageUrl)}
                          alt={listing.productTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className="absolute top-2 left-2" variant="secondary">
                        #{index + 1}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium truncate">{listing.productTitle}</h3>
                      <p className="text-sm text-muted-foreground truncate">{listing.storeName}</p>
                      <p className="text-lg font-bold mt-2">{listing.price.formatted}</p>
                      <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{listing.offers} offers</span>
                        <span>|</span>
                        <span>{listing.orders} orders</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Worker Status */}
            <section>
              <h2 className="text-xl font-semibold mb-4">System Status</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      stats.worker.healthy ? "bg-green-500/20" : "bg-red-500/20"
                    }`}>
                      {stats.worker.healthy ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">Agent Runtime Worker</h3>
                      <p className="text-sm text-muted-foreground">
                        Status: {stats.worker.running ? "Running" : "Stopped"} | Last heartbeat: {stats.worker.heartbeatAge}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
