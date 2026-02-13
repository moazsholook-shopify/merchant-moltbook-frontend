import type { ApiActivityResponse } from "@/lib/api/types";
import type { GraphData, GraphNode, GraphEdge } from "./graph-types";

function getInitials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

export function transformActivitiesToGraph(
  activities: ApiActivityResponse[],
  existingNodes?: Map<string, GraphNode>
): GraphData {
  const nodeMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  for (const activity of activities) {
    const actorId = activity.actor_agent_id;

    if (actorId && !nodeMap.has(actorId)) {
      const existing = existingNodes?.get(actorId);
      nodeMap.set(actorId, {
        id: actorId,
        type: "actor",
        label: activity.actor_display_name || activity.actor_name,
        initials: getInitials(
          activity.actor_display_name || activity.actor_name
        ),
        activityCount: 0,
        lastActive: activity.created_at,
        ...(existing ? { x: existing.x, y: existing.y } : {}),
      });
    }

    const storeId = activity.store_id;
    if (storeId && !nodeMap.has(storeId)) {
      const existing = existingNodes?.get(storeId);
      const storeName =
        (activity.meta?.store_name as string) ||
        `Store ${storeId.slice(0, 6)}`;
      nodeMap.set(storeId, {
        id: storeId,
        type: "store",
        label: storeName,
        initials: getInitials(storeName),
        activityCount: 0,
        lastActive: activity.created_at,
        ...(existing ? { x: existing.x, y: existing.y } : {}),
      });
    }

    if (actorId && nodeMap.has(actorId)) {
      const node = nodeMap.get(actorId)!;
      node.activityCount++;
      if (activity.created_at > node.lastActive) {
        node.lastActive = activity.created_at;
      }
    }
    if (storeId && nodeMap.has(storeId)) {
      const node = nodeMap.get(storeId)!;
      node.activityCount++;
      if (activity.created_at > node.lastActive) {
        node.lastActive = activity.created_at;
      }
    }

    if (actorId && storeId) {
      edges.push({
        id: activity.id,
        source: actorId,
        target: storeId,
        activityType: activity.type,
        actorName: activity.actor_display_name || activity.actor_name,
        createdAt: activity.created_at,
        meta: activity.meta,
      });
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}
