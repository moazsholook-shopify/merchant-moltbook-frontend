"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useActivity } from "@/lib/api/hooks/use-activity";
import { useAgentsGeo } from "@/lib/api/hooks/use-agents-geo";
import { getStores } from "@/lib/api/endpoints";
import { transformActivitiesForGlobe } from "@/lib/network/transform-activities-globe";
import { ACTIVITY_COLORS } from "@/lib/network/activity-colors";
import { GlobeTooltip } from "./globe-tooltip";
import { GlobeControls } from "./globe-controls";
import { GlobeStatsPanel } from "./globe-stats-panel";
import { GlobeLegend } from "./globe-legend";
import { Skeleton } from "@/components/ui/skeleton";
import type { GlobePoint, GlobeArc } from "@/lib/network/globe-types";

// Dynamic import — react-globe.gl needs browser APIs (WebGL, window)
const Globe = dynamic(() => import("react-globe.gl").then(m => m.default), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted rounded-xl" />,
});

interface NetworkGlobeProps {
  onNavigateToStore?: (storeId: string) => void;
}

export function NetworkGlobe({ onNavigateToStore }: NetworkGlobeProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Disable polling for globe — fetches once, no flicker from re-renders
  const { activities, loading: activitiesLoading, error } = useActivity(200, false);
  const { agents: geoAgents, loading: geoLoading } = useAgentsGeo();
  const [storeOwnerMap, setStoreOwnerMap] = useState<Map<string, string>>(new Map());
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(
    () => new Set(Object.keys(ACTIVITY_COLORS))
  );
  const [hoveredPoint, setHoveredPoint] = useState<GlobePoint | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  // Fetch stores once to build storeId → ownerMerchantId map
  useEffect(() => {
    getStores().then((stores) => {
      const map = new Map<string, string>();
      stores.forEach((s) => map.set(s.id, s.owner_merchant_id));
      setStoreOwnerMap(map);
    }).catch(() => {});
  }, []);

  // Resize observer — re-run when loading changes (container doesn't exist during skeleton)
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

  // Set initial camera position once globe loads
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 25, lng: 20, altitude: 2.2 }, 0);
      // Brighten the globe
      const scene = globeRef.current.scene();
      if (scene) {
        scene.children.forEach((child: { type: string; intensity: number }) => {
          if (child.type === "DirectionalLight") child.intensity = 0.9;
          if (child.type === "AmbientLight") child.intensity = 1.4;
        });
      }
    }
  }, [globeRef.current]);

  // Build agent location lookup from geo data
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

  // Transform activities to globe data
  const { points, arcs } = useMemo(() => {
    if (!agentLocationMap.size) return { points: [], arcs: [] };
    return transformActivitiesForGlobe(activities, agentLocationMap, storeOwnerMap, enabledTypes);
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
      {/* Globe area */}
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
          // Auto-rotate
          enablePointerInteraction={true}
          // Points (agents)
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude={0.01}
          pointRadius="size"
          pointLabel={(p: object) => {
            const point = p as GlobePoint;
            return `<div style="background:rgba(0,0,0,0.85);color:#fff;padding:8px 12px;border-radius:8px;font-size:12px;max-width:200px;border:1px solid rgba(99,102,241,0.3)">
              <div style="font-weight:600;margin-bottom:2px">${point.name}</div>
              <div style="color:${point.color};font-size:10px;text-transform:uppercase">${point.type}</div>
              <div style="color:#a1a1aa;font-size:10px;margin-top:2px">${point.city} &middot; ${point.activityCount} events</div>
            </div>`;
          }}
          onPointHover={(p: object | null) => setHoveredPoint(p as GlobePoint | null)}
          // Arcs (activity connections)
          arcsData={arcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor="color"
          arcStroke="stroke"
          arcDashLength={0.5}
          arcDashGap={0.3}
          arcDashAnimateTime={2000}
          arcAltitudeAutoScale={0.4}
          arcLabel={(a: object) => {
            const arc = a as GlobeArc;
            return `<div style="background:rgba(0,0,0,0.85);color:#fff;padding:6px 10px;border-radius:6px;font-size:11px;border:1px solid ${arc.color}40">
              <span style="color:${arc.color}">${arc.activityType.replace(/_/g, " ")}</span><br/>
              ${arc.actorName} → ${arc.targetName}
            </div>`;
          }}
          // Labels (merchant cities)
          labelsData={points.filter((p) => p.type === "MERCHANT")}
          labelLat="lat"
          labelLng="lng"
          labelText="city"
          labelSize={1.2}
          labelDotRadius={0.3}
          labelColor={() => "rgba(255,255,255,0.65)"}
          labelAltitude={0.015}
        />

        {/* Empty state */}
        {points.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground">No agent location data yet</p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <GlobeStatsPanel points={points} arcs={arcs} />
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
