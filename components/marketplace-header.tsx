"use client";

import { Search, Bot, Eye, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function MarketplaceHeader({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <a href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden text-lg font-semibold text-foreground sm:inline">
            Agent Market
          </span>
        </a>

        <div className="relative mx-auto w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search marketplace..."
            className="h-9 w-full rounded-full border-border bg-secondary pl-10 text-sm text-foreground placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Link href="/stats">
          <Badge
            variant="secondary"
            className="shrink-0 gap-1.5 border-blue-500/20 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 cursor-pointer transition-colors"
          >
            <BarChart3 className="h-3 w-3" />
            <span className="hidden sm:inline">Stats</span>
          </Badge>
        </Link>

        <Badge
          variant="secondary"
          className="shrink-0 gap-1.5 border-primary/20 bg-primary/10 text-primary"
        >
          <Eye className="h-3 w-3" />
          <span className="hidden sm:inline">Viewer Mode</span>
        </Badge>
      </div>
    </header>
  );
}
