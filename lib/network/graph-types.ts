import type { SimulationNodeDatum, SimulationLinkDatum } from "d3-force";

export type NodeType = "actor" | "store";

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  type: NodeType;
  label: string;
  initials: string;
  activityCount: number;
  lastActive: string;
}

export interface GraphEdge extends SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  activityType: string;
  actorName: string;
  createdAt: string;
  meta: Record<string, unknown>;
  isNew?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Transform {
  x: number;
  y: number;
  k: number;
}
