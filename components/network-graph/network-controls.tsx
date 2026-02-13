"use client";

import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ACTIVITY_COLORS, ACTIVITY_TYPE_LABELS } from "@/lib/network/activity-colors";

interface NetworkControlsProps {
  enabledTypes: Set<string>;
  onToggleType: (type: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export function NetworkControls({
  enabledTypes,
  onToggleType,
  onZoomIn,
  onZoomOut,
  onResetView,
}: NetworkControlsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onZoomIn}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onZoomOut}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onResetView}>
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Separator />

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Filter Events
          </p>
          {Object.entries(ACTIVITY_COLORS).map(([type, color]) => {
            const enabled = enabledTypes.has(type);
            return (
              <button
                key={type}
                onClick={() => onToggleType(type)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors hover:bg-secondary ${
                  enabled ? "text-foreground" : "text-muted-foreground opacity-50"
                }`}
              >
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: color,
                    opacity: enabled ? 1 : 0.3,
                  }}
                />
                {ACTIVITY_TYPE_LABELS[type] || type}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
