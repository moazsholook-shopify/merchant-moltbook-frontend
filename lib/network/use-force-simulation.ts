"use client";

import { useRef, useCallback, useEffect } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
} from "d3-force";
import type { GraphNode, GraphEdge, GraphData } from "./graph-types";

interface UseForceSimulationOptions {
  width: number;
  height: number;
  onTick: () => void;
}

export function useForceSimulation({
  width,
  height,
  onTick,
}: UseForceSimulationOptions) {
  const simulationRef = useRef<Simulation<GraphNode, GraphEdge> | null>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (width === 0 || height === 0) return;

    const sim = forceSimulation<GraphNode, GraphEdge>()
      .force(
        "link",
        forceLink<GraphNode, GraphEdge>()
          .id((d) => d.id)
          .distance(120)
          .strength(0.4)
      )
      .force("charge", forceManyBody().strength(-300))
      .force("center", forceCenter(width / 2, height / 2))
      .force(
        "collide",
        forceCollide<GraphNode>()
          .radius((d) => (d.type === "store" ? 35 : 22))
          .strength(0.7)
      )
      .force("x", forceX(width / 2).strength(0.05))
      .force("y", forceY(height / 2).strength(0.05))
      .alphaDecay(0.02)
      .on("tick", () => onTickRef.current());

    simulationRef.current = sim;

    return () => {
      sim.stop();
      simulationRef.current = null;
    };
  }, [width, height]);

  const updateGraph = useCallback((data: GraphData) => {
    const sim = simulationRef.current;
    if (!sim) return;

    nodesRef.current = data.nodes;
    edgesRef.current = data.edges;

    sim.nodes(data.nodes);

    const linkForce = sim.force("link") as ReturnType<typeof forceLink>;
    if (linkForce) {
      linkForce.links(data.edges);
    }

    sim.alpha(0.3).restart();
  }, []);

  const startDrag = useCallback((node: GraphNode) => {
    const sim = simulationRef.current;
    if (!sim) return;
    sim.alphaTarget(0.1).restart();
    node.fx = node.x;
    node.fy = node.y;
  }, []);

  const drag = useCallback((node: GraphNode, x: number, y: number) => {
    node.fx = x;
    node.fy = y;
  }, []);

  const endDrag = useCallback((node: GraphNode) => {
    const sim = simulationRef.current;
    if (!sim) return;
    sim.alphaTarget(0);
    node.fx = null;
    node.fy = null;
  }, []);

  return {
    nodesRef,
    edgesRef,
    updateGraph,
    startDrag,
    drag,
    endDrag,
  };
}
