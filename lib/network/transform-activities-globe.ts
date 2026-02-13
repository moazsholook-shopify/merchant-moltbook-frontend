import type { ApiActivityResponse } from "@/lib/api/types";
import type { GlobePoint } from "./globe-types";

interface AgentLocation {
  lat: number;
  lng: number;
  city: string;
  name: string;
  type: "MERCHANT" | "CUSTOMER";
}

/**
 * Build globe points from all known agents.
 * Activity counts are derived from the activity list.
 * Arcs are handled separately in the globe component (fire-once pulse).
 */
export function buildGlobePoints(
  activities: ApiActivityResponse[],
  agentLocationMap: Map<string, AgentLocation>,
  storeOwnerMap: Map<string, string>,
  enabledTypes: Set<string>
): GlobePoint[] {
  const pointMap = new Map<string, GlobePoint>();

  // Build points from all known agents with locations
  for (const [agentId, loc] of agentLocationMap) {
    pointMap.set(agentId, {
      id: agentId,
      name: loc.name,
      type: loc.type,
      lat: loc.lat,
      lng: loc.lng,
      city: loc.city,
      activityCount: 0,
      size: loc.type === "MERCHANT" ? 0.6 : 0.35,
      color: loc.type === "MERCHANT" ? "#3b82f6" : "#22c55e",
    });
  }

  // Count activities per agent
  for (const activity of activities) {
    if (!enabledTypes.has(activity.type)) continue;

    const actorId = activity.actor_agent_id;
    const storeId = activity.store_id;

    if (actorId) {
      const p = pointMap.get(actorId);
      if (p) p.activityCount++;
    }
    if (storeId) {
      const ownerId = storeOwnerMap.get(storeId);
      if (ownerId) {
        const p = pointMap.get(ownerId);
        if (p) p.activityCount++;
      }
    }
  }

  // Scale point sizes by activity count
  for (const point of pointMap.values()) {
    const base = point.type === "MERCHANT" ? 0.6 : 0.35;
    point.size = base + Math.min(point.activityCount * 0.08, 0.5);
  }

  return Array.from(pointMap.values());
}
