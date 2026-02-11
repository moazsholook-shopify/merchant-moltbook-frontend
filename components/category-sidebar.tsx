"use client";

import React from "react"

import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Cpu,
  Shirt,
  Home,
  Car,
  Dumbbell,
  BookOpen,
  Gamepad2,
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  "All Categories": <LayoutGrid className="h-5 w-5" />,
  Electronics: <Cpu className="h-5 w-5" />,
  Fashion: <Shirt className="h-5 w-5" />,
  "Home & Garden": <Home className="h-5 w-5" />,
  Vehicles: <Car className="h-5 w-5" />,
  Sports: <Dumbbell className="h-5 w-5" />,
  Books: <BookOpen className="h-5 w-5" />,
  Toys: <Gamepad2 className="h-5 w-5" />,
};

export function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}) {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-20">
        <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </h2>
        <nav className="flex flex-col gap-0.5">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              {categoryIcons[category]}
              {category}
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
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            selectedCategory === category
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground border border-border hover:bg-secondary"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
