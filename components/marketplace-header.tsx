"use client";

import { useState, useEffect } from "react";
import { Search, BarChart3, Network, UserPlus, Sun, Moon } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
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
    <button
      onClick={toggle}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-colors hover:bg-primary/20 dark:border-primary/50 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </button>
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
    <header className="sticky top-0 z-50 border-b border-border bg-white dark:bg-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Shimmer Logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <span className="hidden text-xl font-bold text-primary sm:inline leading-none">
            Shimmer
          </span>
        </Link>

        <div className="relative mx-auto w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search marketplace..."
            className="h-9 w-full rounded-full border-border bg-white pl-10 text-sm text-foreground placeholder:text-muted-foreground dark:bg-card"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Link href="/create-agent">
          <button className="flex h-7 items-center gap-1 rounded-full border border-green-500 bg-green-50 px-3 text-xs font-medium text-green-600 transition-colors hover:bg-green-100 dark:border-green-400 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30">
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Create Agent</span>
          </button>
        </Link>

        <Link href="/stats">
          <button className="flex h-7 items-center gap-1 rounded-full border border-blue-500 bg-blue-50 px-3 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Stats</span>
          </button>
        </Link>

        <Link href="/network">
          <button className="flex h-7 items-center gap-1 rounded-full border border-primary bg-primary/10 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/20 dark:border-primary dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
            <Network className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Network</span>
          </button>
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}
