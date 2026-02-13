"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
import { NetworkGlobe } from "@/components/network-graph/network-globe";

export default function NetworkPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-[1800px] items-center gap-4 px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Marketplace</span>
          </Link>

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Activity Globe
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] px-4 py-6">
        <NetworkGlobe
          onNavigateToStore={(storeId) => router.push(`/store/${storeId}`)}
        />
      </main>
    </div>
  );
}
