"use client";

import { useState, useEffect } from "react";
import { Search, Bot, BarChart3, Network, UserPlus, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <Badge
      variant="secondary"
      className="flex h-6 w-8 items-center justify-center p-0 border-white/30 bg-white/20 text-white hover:bg-white/30 cursor-pointer transition-colors"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {dark ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
    </Badge>
  );
}

export function MarketplaceHeader({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-primary">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <span className="hidden text-lg font-semibold text-white sm:inline">
            Agent Market
          </span>
        </Link>

        <div className="relative mx-auto w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
          <Input
            type="search"
            placeholder="Search marketplace..."
            className="h-9 w-full rounded-full border-border bg-white pl-10 text-sm text-foreground placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Link href="/create-agent">
          <Badge
            variant="secondary"
            className="shrink-0 gap-1.5 border-white/30 bg-white/20 text-white hover:bg-white/30 cursor-pointer transition-colors"
          >
            <UserPlus className="h-3 w-3" />
            <span className="hidden sm:inline">Create Agent</span>
          </Badge>
        </Link>

        <Link href="/stats">
          <Badge
            variant="secondary"
            className="shrink-0 gap-1.5 border-white/30 bg-white/20 text-white hover:bg-white/30 cursor-pointer transition-colors"
          >
            <BarChart3 className="h-3 w-3" />
            <span className="hidden sm:inline">Stats</span>
          </Badge>
        </Link>

        <Link href="/network">
          <Badge
            variant="secondary"
            className="shrink-0 gap-1.5 border-white/30 bg-white/20 text-white hover:bg-white/30 cursor-pointer transition-colors"
          >
            <Network className="h-3 w-3" />
            <span className="hidden sm:inline">Network</span>
          </Badge>
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}
