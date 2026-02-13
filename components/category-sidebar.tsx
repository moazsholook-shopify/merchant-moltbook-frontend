"use client";

import React, { useState, useMemo } from "react"
import { cn } from "@/lib/utils";
import { ChevronRight, Store, Search, X } from "lucide-react";

export interface StoreFilter {
  id: string;
  name: string;
}

export function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  totalListings,
}: {
  categories: StoreFilter[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  totalListings?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [search, setSearch] = useState("");

  const filteredStores = useMemo(() => {
    if (!search) return categories;
    return categories.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, search]);

  return (
    <aside className="hidden w-56 shrink-0 lg:block self-start">
      <div className="sticky top-6 space-y-3">
        {/* Summary */}
        <div className="px-3">
          <p className="text-xs text-muted-foreground">
            {totalListings !== undefined ? `${totalListings} listings` : ""} · {categories.length} stores
          </p>
        </div>

        {/* All Stores */}
        <button
          onClick={() => { onSelectCategory("All Stores"); setIsExpanded(false); }}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
            selectedCategory === "All Stores"
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-secondary"
          )}
        >
          All Stores
        </button>

        {/* Browse by Store toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5" />
            Browse by Store
          </span>
          <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
        </button>

        {/* Expandable store list */}
        {isExpanded && (
          <div className="space-y-1">
            {/* Search within stores */}
            {categories.length > 6 && (
              <div className="relative px-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter stores..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-md border border-border bg-background py-1 pl-7 pr-6 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            )}

            <nav className="ml-3 flex flex-col gap-0.5 border-l border-border pl-2 max-h-60 overflow-y-auto">
              {filteredStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => onSelectCategory(store.id)}
                  className={cn(
                    "flex items-center rounded-md px-2 py-1.5 text-xs transition-colors text-left",
                    selectedCategory === store.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <span className="truncate">{store.name}</span>
                </button>
              ))}
              {filteredStores.length === 0 && (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">No stores match</p>
              )}
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
}

export function CategoryMobileBar({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: StoreFilter[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedName = selectedCategory === "All Stores"
    ? "All Stores"
    : categories.find(s => s.id === selectedCategory)?.name || "All Stores";

  return (
    <div className="relative px-4 pb-3 lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-foreground"
      >
        <Store className="h-4 w-4" />
        <span>{selectedName}</span>
        <ChevronRight className={`h-3 w-3 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-4 z-20 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
          <button
            onClick={() => { onSelectCategory("All Stores"); setIsOpen(false); }}
            className={cn(
              "flex w-full px-3 py-2 text-sm transition-colors text-left",
              selectedCategory === "All Stores" ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-secondary"
            )}
          >
            All Stores
          </button>
          {categories.map((store) => (
            <button
              key={store.id}
              onClick={() => { onSelectCategory(store.id); setIsOpen(false); }}
              className={cn(
                "flex w-full px-3 py-2 text-sm transition-colors text-left",
                selectedCategory === store.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {store.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
