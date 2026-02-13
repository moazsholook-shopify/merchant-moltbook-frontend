"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useActivity } from "@/lib/api/hooks/use-activity";
import { transformActivitiesToGraph } from "@/lib/network/transform-activities";
import { useForceSimulation } from "@/lib/network/use-force-simulation";
import { ACTIVITY_COLORS } from "@/lib/network/activity-colors";
import { drawFrame, findNodeAtPoint } from "./network-canvas";
import { NetworkTooltip } from "./network-tooltip";
import { NetworkControls } from "./network-controls";
import { NetworkLegend } from "./network-legend";
import { NetworkStatsPanel } from "./network-stats-panel";
import { Skeleton } from "@/components/ui/skeleton";
import type { GraphNode, GraphEdge, Transform } from "@/lib/network/graph-types";

interface NetworkGraphProps {
  onNavigateToStore?: (storeId: string) => void;
  onNavigateToListing?: (listingId: string) => void;
}

export function NetworkGraph({
  onNavigateToStore,
  onNavigateToListing,
}: NetworkGraphProps) {
  const { activities, loading, error } = useActivity(200, true);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(
    () => new Set(Object.keys(ACTIVITY_COLORS))
  );
  const [displayNodes, setDisplayNodes] = useState<GraphNode[]>([]);
  const [displayEdges, setDisplayEdges] = useState<GraphEdge[]>([]);

  const existingNodesRef = useRef<Map<string, GraphNode>>(new Map());
  const dragNodeRef = useRef<GraphNode | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const rafRef = useRef<number>(0);

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  // Canvas redraw callback
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    drawFrame({
      ctx,
      nodes: simulationAPI.nodesRef.current,
      edges: simulationAPI.edgesRef.current,
      width: dimensions.width,
      height: dimensions.height,
      transform: transformRef.current,
      hoveredNode,
      enabledTypes,
      isDark,
      dpr,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, hoveredNode, enabledTypes, isDark]);

  const onTick = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(redraw);
  }, [redraw]);

  const simulationAPI = useForceSimulation({
    width: dimensions.width,
    height: dimensions.height,
    onTick,
  });

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Set canvas size for retina
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    redraw();
  }, [dimensions, redraw]);

  // Transform activities into graph data
  useEffect(() => {
    if (activities.length === 0) return;

    const graphData = transformActivitiesToGraph(
      activities,
      existingNodesRef.current
    );

    existingNodesRef.current = new Map(
      graphData.nodes.map((n) => [n.id, n])
    );

    setDisplayNodes([...graphData.nodes]);
    setDisplayEdges([...graphData.edges]);
    simulationAPI.updateGraph(graphData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities]);

  // Redraw when filters or hover change
  useEffect(() => {
    redraw();
  }, [redraw]);

  // Mouse handlers
  const getCanvasCoords = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = getCanvasCoords(e);

      if (dragNodeRef.current) {
        const gx = (pos.x - transformRef.current.x) / transformRef.current.k;
        const gy = (pos.y - transformRef.current.y) / transformRef.current.k;
        simulationAPI.drag(dragNodeRef.current, gx, gy);
        return;
      }

      if (isPanningRef.current) {
        const dx = pos.x - panStartRef.current.x;
        const dy = pos.y - panStartRef.current.y;
        setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
        panStartRef.current = pos;
        return;
      }

      const node = findNodeAtPoint(
        pos.x,
        pos.y,
        simulationAPI.nodesRef.current,
        transformRef.current
      );
      setHoveredNode(node);
      if (node) {
        setTooltipPos({
          x: (node.x || 0) * transformRef.current.k + transformRef.current.x,
          y: (node.y || 0) * transformRef.current.k + transformRef.current.y,
        });
      }
    },
    [getCanvasCoords, simulationAPI]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const pos = getCanvasCoords(e);
      const node = findNodeAtPoint(
        pos.x,
        pos.y,
        simulationAPI.nodesRef.current,
        transformRef.current
      );

      if (node) {
        dragNodeRef.current = node;
        simulationAPI.startDrag(node);
      } else {
        isPanningRef.current = true;
        panStartRef.current = pos;
      }
    },
    [getCanvasCoords, simulationAPI]
  );

  const handleMouseUp = useCallback(() => {
    if (dragNodeRef.current) {
      simulationAPI.endDrag(dragNodeRef.current);
      dragNodeRef.current = null;
    }
    isPanningRef.current = false;
  }, [simulationAPI]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isPanningRef.current) return;
      const pos = getCanvasCoords(e);
      const node = findNodeAtPoint(
        pos.x,
        pos.y,
        simulationAPI.nodesRef.current,
        transformRef.current
      );
      if (node?.type === "store" && onNavigateToStore) {
        onNavigateToStore(node.id);
      }
    },
    [getCanvasCoords, simulationAPI, onNavigateToStore]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const pos = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;

    setTransform((t) => {
      const newK = Math.max(0.15, Math.min(4, t.k * scaleFactor));
      const ratio = newK / t.k;
      return {
        x: pos.x - (pos.x - t.x) * ratio,
        y: pos.y - (pos.y - t.y) * ratio,
        k: newK,
      };
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredNode(null);
    if (dragNodeRef.current) {
      simulationAPI.endDrag(dragNodeRef.current);
      dragNodeRef.current = null;
    }
    isPanningRef.current = false;
  }, [simulationAPI]);

  // Control callbacks
  const handleToggleType = useCallback((type: string) => {
    setEnabledTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    setTransform((t) => {
      const newK = Math.min(4, t.k * 1.3);
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;
      const ratio = newK / t.k;
      return {
        x: cx - (cx - t.x) * ratio,
        y: cy - (cy - t.y) * ratio,
        k: newK,
      };
    });
  }, [dimensions]);

  const handleZoomOut = useCallback(() => {
    setTransform((t) => {
      const newK = Math.max(0.15, t.k / 1.3);
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;
      const ratio = newK / t.k;
      return {
        x: cx - (cx - t.x) * ratio,
        y: cy - (cy - t.y) * ratio,
        k: newK,
      };
    });
  }, [dimensions]);

  const handleResetView = useCallback(() => {
    setTransform({ x: 0, y: 0, k: 1 });
  }, []);

  const cursorStyle = useMemo(() => {
    if (dragNodeRef.current) return "grabbing";
    if (hoveredNode) return "pointer";
    return "grab";
  }, [hoveredNode]);

  if (loading && activities.length === 0) {
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
        <p className="text-lg font-medium text-destructive">
          Error loading activity data
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
      {/* Canvas area */}
      <div
        ref={containerRef}
        className="relative h-[calc(100vh-8rem)] min-h-[500px] overflow-hidden rounded-xl border border-border bg-card"
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ cursor: cursorStyle }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          onWheel={handleWheel}
          onMouseLeave={handleMouseLeave}
        />

        {hoveredNode && (
          <NetworkTooltip
            node={hoveredNode}
            edges={simulationAPI.edgesRef.current}
            x={tooltipPos.x}
            y={tooltipPos.y}
          />
        )}

        {activities.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground">No activity data yet</p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <NetworkStatsPanel nodes={displayNodes} edges={displayEdges} />
        <NetworkControls
          enabledTypes={enabledTypes}
          onToggleType={handleToggleType}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
        />
        <NetworkLegend />
      </div>
    </div>
  );
}
