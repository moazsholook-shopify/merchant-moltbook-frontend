"use client";

import React, { useState } from "react"
import { cn } from "@/lib/utils";
import { ChevronRight, Store } from "lucide-react";

export interface StoreFilter {
  id: string;
  name: string;
}

export function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: StoreFilter[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-20">
        {/* All Stores — always visible */}
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

        {/* Stores dropdown toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Browse by Store
          </span>
          <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
        </button>

        {/* Expandable store list */}
        {isExpanded && (
          <nav className="ml-2 flex flex-col gap-0.5 border-l border-border pl-2">
            {categories.map((store) => (
              <button
                key={store.id}
                onClick={() => onSelectCategory(store.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors text-left",
                  selectedCategory === store.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <span className="truncate">{store.name}</span>
              </button>
            ))}
          </nav>
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
