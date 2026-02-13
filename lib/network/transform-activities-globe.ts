import type { ApiActivityResponse, AgentGeoResponse } from "@/lib/api/types";
import type { GlobePoint, GlobeArc } from "./globe-types";
import { getActivityColor } from "./activity-colors";

interface AgentLocation {
  lat: number;
  lng: number;
  city: string;
  name: string;
  type: "MERCHANT" | "CUSTOMER";
}

export function transformActivitiesForGlobe(
  activities: ApiActivityResponse[],
  agentLocationMap: Map<string, AgentLocation>,
  storeOwnerMap: Map<string, string>, // storeId → ownerMerchantId
  enabledTypes: Set<string>
): { points: GlobePoint[]; arcs: GlobeArc[] } {
  const pointMap = new Map<string, GlobePoint>();
  const arcAggregation = new Map<string, GlobeArc>();

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

  // Process activities to build arcs and increment activity counts
  for (const activity of activities) {
    if (!enabledTypes.has(activity.type)) continue;

    const actorId = activity.actor_agent_id;
    const storeId = activity.store_id;
    if (!actorId || !storeId) continue;

    // Increment actor activity count
    const actorPoint = pointMap.get(actorId);
    if (actorPoint) actorPoint.activityCount++;

    // Find the store owner (merchant) location
    const ownerId = storeOwnerMap.get(storeId);
    if (!ownerId) continue;

    const ownerPoint = pointMap.get(ownerId);
    if (ownerPoint) ownerPoint.activityCount++;

    // Only create arcs between agents with locations, and skip self-arcs
    const actorLoc = agentLocationMap.get(actorId);
    const ownerLoc = agentLocationMap.get(ownerId);
    if (!actorLoc || !ownerLoc || actorId === ownerId) continue;

    // Aggregate arcs between same pair
    const pairKey = `${actorId}-${ownerId}-${activity.type}`;
    const existing = arcAggregation.get(pairKey);
    if (existing) {
      existing.stroke = Math.min(existing.stroke + 0.3, 4);
    } else {
      arcAggregation.set(pairKey, {
        id: pairKey,
        startLat: actorLoc.lat,
        startLng: actorLoc.lng,
        endLat: ownerLoc.lat,
        endLng: ownerLoc.lng,
        activityType: activity.type,
        color: getActivityColor(activity.type),
        stroke: 0.8,
        actorName: actorLoc.name,
        targetName: ownerLoc.name,
      });
    }
  }

  // Scale point sizes by activity count
  for (const point of pointMap.values()) {
    const base = point.type === "MERCHANT" ? 0.6 : 0.35;
    point.size = base + Math.min(point.activityCount * 0.08, 0.5);
  }

  return {
    points: Array.from(pointMap.values()),
    arcs: Array.from(arcAggregation.values()),
  };
}
