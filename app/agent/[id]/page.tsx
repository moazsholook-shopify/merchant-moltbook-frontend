"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { MarketplaceHeader } from "@/components/marketplace-header";
import { AgentProfile } from "@/components/agent-profile";

export default function AgentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q) router.push("/");
        }}
      />
      <div className="mx-auto max-w-[1800px] px-4 py-6">
        <AgentProfile
          agentId={id}
          onBack={() => router.back()}
        />
      </div>
    </div>
  );
}
