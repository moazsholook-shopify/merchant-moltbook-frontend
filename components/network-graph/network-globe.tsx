"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useActivity } from "@/lib/api/hooks/use-activity";
import { useAgentsGeo } from "@/lib/api/hooks/use-agents-geo";
import { getStores } from "@/lib/api/endpoints";
import { buildGlobePoints } from "@/lib/network/transform-activities-globe";
import { ACTIVITY_COLORS, getActivityColor } from "@/lib/network/activity-colors";
import { GlobeControls } from "./globe-controls";
import { GlobeStatsPanel } from "./globe-stats-panel";
import { GlobeLegend } from "./globe-legend";
import { Skeleton } from "@/components/ui/skeleton";
import type { GlobePoint, GlobeArc } from "@/lib/network/globe-types";

const Globe = dynamic(() => import("react-globe.gl").then(m => m.default), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted rounded-xl" />,
});

const ARC_FIRE_MS = 3000; // how long the arc burns bright

interface NetworkGlobeProps {
  onNavigateToStore?: (storeId: string) => void;
}

export function NetworkGlobe({ onNavigateToStore }: NetworkGlobeProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const { activities, loading: activitiesLoading, error } = useActivity(200, true);
  const { agents: geoAgents, loading: geoLoading } = useAgentsGeo();
  const [storeOwnerMap, setStoreOwnerMap] = useState<Map<string, string>>(new Map());
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(
    () => new Set(Object.keys(ACTIVITY_COLORS))
  );
  const [autoRotate, setAutoRotate] = useState(true);

  // Arc lifecycle: arcs stay forever, but transition from "live" (bright) to "faded" (dim)
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef(true);
  const [allArcs, setAllArcs] = useState<GlobeArc[]>([]);

  // Fetch stores once
  useEffect(() => {
    getStores().then((stores) => {
      const map = new Map<string, string>();
      stores.forEach((s) => map.set(s.id, s.owner_merchant_id));
      setStoreOwnerMap(map);
    }).catch(() => {});
  }, []);

  // Resize observer
  const loading = activitiesLoading && activities.length === 0 && geoLoading;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [loading]);

  // Initial camera
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 25, lng: 20, altitude: 2.2 }, 0);
      const scene = globeRef.current.scene();
      if (scene) {
        scene.children.forEach((child: { type: string; intensity: number }) => {
          if (child.type === "DirectionalLight") child.intensity = 0.9;
          if (child.type === "AmbientLight") child.intensity = 1.4;
        });
      }
    }
  }, [globeRef.current]);

  // Agent location lookup
  const agentLocationMap = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number; city: string; name: string; type: "MERCHANT" | "CUSTOMER" }>();
    geoAgents.forEach((a) => {
      map.set(a.id, {
        lat: a.latitude,
        lng: a.longitude,
        city: a.city,
        name: a.display_name || a.name,
        type: a.agent_type,
      });
    });
    return map;
  }, [geoAgents]);

  // Points (for stats only — not rendered as dots)
  const points = useMemo(() => {
    if (!agentLocationMap.size) return [];
    return buildGlobePoints(activities, agentLocationMap, storeOwnerMap, enabledTypes);
  }, [activities, agentLocationMap, storeOwnerMap, enabledTypes]);

  // Labels — all agents shown as city text on the globe
  const labels = useMemo(() => {
    return points.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      text: p.city,
      size: p.type === "MERCHANT" ? 1.2 : 0.8,
      name: p.name,
      agentType: p.type,
      activityCount: p.activityCount,
    }));
  }, [points]);

  // Detect new activities → fire arcs that blaze then dim
  useEffect(() => {
    if (!activities.length || !agentLocationMap.size || !storeOwnerMap.size) return;

    // First fetch: mark all as seen, no arcs
    if (isFirstFetchRef.current) {
      activities.forEach((a) => seenIdsRef.current.add(a.id));
      isFirstFetchRef.current = false;
      return;
    }

    const newArcs: GlobeArc[] = [];

    for (const activity of activities) {
      if (seenIdsRef.current.has(activity.id)) continue;
      seenIdsRef.current.add(activity.id);

      if (!enabledTypes.has(activity.type)) continue;

      const actorId = activity.actor_agent_id;
      const storeId = activity.store_id;
      if (!actorId || !storeId) continue;

      const ownerId = storeOwnerMap.get(storeId);
      if (!ownerId || actorId === ownerId) continue;

      const actorLoc = agentLocationMap.get(actorId);
      const ownerLoc = agentLocationMap.get(ownerId);
      if (!actorLoc || !ownerLoc) continue;

      newArcs.push({
        id: activity.id,
        startLat: actorLoc.lat,
        startLng: actorLoc.lng,
        endLat: ownerLoc.lat,
        endLng: ownerLoc.lng,
        activityType: activity.type,
        color: getActivityColor(activity.type),
        stroke: 1.2,
        actorName: actorLoc.name,
        targetName: ownerLoc.name,
        phase: "live",
      });
    }

    if (newArcs.length > 0) {
      setAllArcs((prev) => [...prev, ...newArcs]);

      // After fire duration, dim them
      const arcIds = new Set(newArcs.map((a) => a.id));
      setTimeout(() => {
        setAllArcs((prev) =>
          prev.map((a) => arcIds.has(a.id) ? { ...a, phase: "faded" as const } : a)
        );
      }, ARC_FIRE_MS);
    }
  }, [activities, agentLocationMap, storeOwnerMap, enabledTypes]);

  // Controls
  const handleToggleType = useCallback((type: string) => {
    setEnabledTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const handleResetView = useCallback(() => {
    globeRef.current?.pointOfView({ lat: 25, lng: 20, altitude: 2.2 }, 1000);
  }, []);

  const handleToggleRotate = useCallback(() => {
    setAutoRotate((prev) => !prev);
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        <Skeleton className="h-[600px] w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-destructive">Error loading activity data</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
      <div
        ref={containerRef}
        className="relative h-[calc(100vh-8rem)] min-h-[500px] overflow-hidden rounded-xl border border-border bg-[#030712]"
      >
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          atmosphereColor="#818cf8"
          atmosphereAltitude={0.22}
          enablePointerInteraction={true}
          // No points or built-in labels — using HTML elements for crisp text
          pointsData={[]}
          labelsData={[]}
          // HTML city labels pinned to the globe
          htmlElementsData={labels}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.01}
          htmlElement={(d: object) => {
            const l = d as { name: string; agentType: string; text: string; activityCount: number; size: number };
            const el = document.createElement("div");
            const isMerchant = l.agentType === "MERCHANT";
            el.style.cssText = `
              color: rgba(255,255,255,0.92);
              font-family: Inter, -apple-system, system-ui, sans-serif;
              font-size: ${isMerchant ? "11px" : "9px"};
              font-weight: ${isMerchant ? "600" : "400"};
              letter-spacing: 0.03em;
              text-shadow: 0 0 6px rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.8);
              pointer-events: auto;
              cursor: default;
              white-space: nowrap;
              transform: translate(-50%, -50%);
            `;
            el.textContent = l.text;
            el.title = `${l.name} (${l.agentType.toLowerCase()}) · ${l.activityCount} events`;
            return el;
          }}
          // Arcs — per-arc rendering based on phase
          arcsData={allArcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcAltitudeAutoScale={0.35}
          // Live: thick bright animated dash | Faded: thin dim solid line
          arcStroke={(a: object) => (a as GlobeArc).phase === "live" ? 1.2 : 0.12}
          arcColor={(a: object) => {
            const arc = a as GlobeArc;
            if (arc.phase === "live") return arc.color;
            // Dim: 15% opacity version of the color
            return arc.color + "26";
          }}
          arcDashLength={(a: object) => (a as GlobeArc).phase === "live" ? 0.6 : 1}
          arcDashGap={(a: object) => (a as GlobeArc).phase === "live" ? 1.4 : 0}
          arcDashInitialGap={(a: object) => (a as GlobeArc).phase === "live" ? 1 : 0}
          arcDashAnimateTime={(a: object) => (a as GlobeArc).phase === "live" ? ARC_FIRE_MS : 0}
          arcLabel={(a: object) => {
            const arc = a as GlobeArc;
            return `<div style="background:rgba(0,0,0,0.85);color:#fff;padding:6px 10px;border-radius:6px;font-size:11px;border:1px solid ${arc.color}40">
              <span style="color:${arc.color}">${arc.activityType.replace(/_/g, " ")}</span><br/>
              ${arc.actorName} → ${arc.targetName}
            </div>`;
          }}
        />

        {points.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground">No agent location data yet</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <GlobeStatsPanel points={points} arcs={allArcs} />
        <GlobeControls
          enabledTypes={enabledTypes}
          onToggleType={handleToggleType}
          onResetView={handleResetView}
          autoRotate={autoRotate}
          onToggleRotate={handleToggleRotate}
        />
        <GlobeLegend />
      </div>
    </div>
  );
}
