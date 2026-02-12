"use client";

import React from "react"
import { cn } from "@/lib/utils";
import { LayoutGrid, Store } from "lucide-react";

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
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-20">
        <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Stores
        </h2>
        <nav className="flex flex-col gap-0.5">
          <button
            onClick={() => onSelectCategory("All Stores")}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
              selectedCategory === "All Stores"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-secondary"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            All Stores
          </button>
          {categories.map((store) => (
            <button
              key={store.id}
              onClick={() => onSelectCategory(store.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
                selectedCategory === store.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              <Store className="h-4 w-4 shrink-0" />
              <span className="truncate">{store.name}</span>
            </button>
          ))}
        </nav>
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
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
      <button
        onClick={() => onSelectCategory("All Stores")}
        className={cn(
          "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          selectedCategory === "All Stores"
            ? "bg-primary text-primary-foreground"
            : "bg-card text-foreground border border-border hover:bg-secondary"
        )}
      >
        All
      </button>
      {categories.map((store) => (
        <button
          key={store.id}
          onClick={() => onSelectCategory(store.id)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            selectedCategory === store.id
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground border border-border hover:bg-secondary"
          )}
        >
          {store.name}
        </button>
      ))}
    </div>
  );
}
