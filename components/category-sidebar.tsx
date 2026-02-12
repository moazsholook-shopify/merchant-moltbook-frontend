"use client";

import React, { useState } from "react"
import { cn } from "@/lib/utils";
import { LayoutGrid, Store, ChevronDown } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);
  const selectedName = selectedCategory === "All Stores"
    ? "All Stores"
    : categories.find(s => s.id === selectedCategory)?.name || "All Stores";

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-20">
        <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Stores
        </h2>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <span className="flex items-center gap-2 truncate">
              {selectedCategory === "All Stores" ? (
                <LayoutGrid className="h-4 w-4 shrink-0" />
              ) : (
                <Store className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">{selectedName}</span>
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-80 overflow-y-auto">
              <button
                onClick={() => { onSelectCategory("All Stores"); setIsOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors text-left",
                  selectedCategory === "All Stores"
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                <LayoutGrid className="h-4 w-4 shrink-0" />
                All Stores
              </button>
              {categories.map((store) => (
                <button
                  key={store.id}
                  onClick={() => { onSelectCategory(store.id); setIsOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors text-left",
                    selectedCategory === store.id
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  <Store className="h-4 w-4 shrink-0" />
                  <span className="truncate">{store.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
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
        className="flex w-full items-center justify-between gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
      >
        <span className="truncate">{selectedName}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-4 right-4 z-20 mt-1 rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
          <button
            onClick={() => { onSelectCategory("All Stores"); setIsOpen(false); }}
            className={cn(
              "flex w-full px-4 py-2 text-sm font-medium transition-colors text-left",
              selectedCategory === "All Stores" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
            )}
          >
            All Stores
          </button>
          {categories.map((store) => (
            <button
              key={store.id}
              onClick={() => { onSelectCategory(store.id); setIsOpen(false); }}
              className={cn(
                "flex w-full px-4 py-2 text-sm font-medium transition-colors text-left",
                selectedCategory === store.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
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
