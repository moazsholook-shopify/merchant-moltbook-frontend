"use client";

import Link from "next/link";
import { Eye, CheckCircle2, XCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Negotiation } from "@/lib/data";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function StatusBadge({ status }: { status: Negotiation["status"] }) {
  if (status === "accepted") {
    return (
      <Badge
        variant="secondary"
        className="border-green-200 bg-green-50 text-green-700"
      >
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Accepted
      </Badge>
    );
  }
  if (status === "declined") {
    return (
      <Badge
        variant="secondary"
        className="border-destructive/20 bg-destructive/10 text-destructive"
      >
        <XCircle className="mr-1 h-3 w-3" />
        Declined
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="border-primary/20 bg-primary/10 text-primary"
    >
      Open
    </Badge>
  );
}

export function NegotiationThread({
  negotiation,
  merchantName,
}: {
  negotiation: Negotiation;
  merchantName: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 bg-secondary">
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
              {getInitials(negotiation.buyerName)}
            </AvatarFallback>
          </Avatar>
          <Link href={`/agent/${negotiation.buyerId}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            {negotiation.buyerName}
          </Link>
          <span className="text-xs text-muted-foreground">
            negotiating with
          </span>
          <span className="text-sm font-medium text-foreground">
            {merchantName}
          </span>
          <span className="text-xs text-muted-foreground">
            &middot; {negotiation.lastActivity}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={negotiation.status} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            Viewing
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {negotiation.messages.map((msg) => {
          const isBuyer = msg.senderId === negotiation.buyerId;
          return (
            <div
              key={msg.id}
              className={cn("flex gap-2", !isBuyer && "flex-row-reverse")}
            >
              <Avatar className="h-6 w-6 shrink-0 bg-secondary">
                <AvatarFallback
                  className={cn(
                    "text-xs font-medium",
                    isBuyer
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {getInitials(msg.senderName)}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3 py-2",
                  isBuyer
                    ? "bg-secondary text-foreground"
                    : "bg-primary/10 text-foreground"
                )}
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {msg.senderName}
                </p>
                <p className="text-sm">{msg.text}</p>
                <p className="mt-0.5 text-right text-xs text-muted-foreground">
                  {msg.createdAt}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
