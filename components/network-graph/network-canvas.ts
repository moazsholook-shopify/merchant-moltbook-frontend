import type { GraphNode, GraphEdge, Transform } from "@/lib/network/graph-types";
import { getActivityColor } from "@/lib/network/activity-colors";

interface DrawOptions {
  ctx: CanvasRenderingContext2D;
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  transform: Transform;
  hoveredNode: GraphNode | null;
  enabledTypes: Set<string>;
  isDark: boolean;
  dpr: number;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function drawFrame(opts: DrawOptions) {
  const { ctx, nodes, edges, width, height, transform, hoveredNode, enabledTypes, isDark, dpr } = opts;

  const bg = isDark ? "#09090b" : "#ffffff";
  const fg = isDark ? "#fafafa" : "#09090b";
  const mutedFg = isDark ? "#a1a1aa" : "#71717a";
  const actorBg = isDark ? "#27272a" : "#f4f4f5";
  const storeBg = isDark ? "#1e3a5f" : "#dbeafe";
  const storeBorder = isDark ? "#3b82f6" : "#2563eb";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(transform.x, transform.y);
  ctx.scale(transform.k, transform.k);

  // Draw edges
  for (const edge of edges) {
    const source = edge.source as GraphNode;
    const target = edge.target as GraphNode;
    if (
      source.x == null || source.y == null ||
      target.x == null || target.y == null
    )
      continue;

    if (!enabledTypes.has(edge.activityType)) continue;

    const color = getActivityColor(edge.activityType);
    const isConnectedToHover =
      hoveredNode &&
      (source.id === hoveredNode.id || target.id === hoveredNode.id);
    const alpha = hoveredNode ? (isConnectedToHover ? 0.9 : 0.1) : 0.35;

    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = isConnectedToHover ? 2 : 1;

    if (edge.isNew) {
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.9;
    }

    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Draw nodes
  for (const node of nodes) {
    if (node.x == null || node.y == null) continue;

    const isHovered = hoveredNode?.id === node.id;
    const isConnected =
      hoveredNode &&
      edges.some(
        (e) =>
          enabledTypes.has(e.activityType) &&
          (((e.source as GraphNode).id === hoveredNode.id &&
            (e.target as GraphNode).id === node.id) ||
            ((e.target as GraphNode).id === hoveredNode.id &&
              (e.source as GraphNode).id === node.id))
      );
    const dimmed = hoveredNode && !isHovered && !isConnected;

    ctx.globalAlpha = dimmed ? 0.2 : 1;

    // Check if this node has any visible edges
    const hasVisibleEdge = edges.some(
      (e) =>
        enabledTypes.has(e.activityType) &&
        ((e.source as GraphNode).id === node.id ||
          (e.target as GraphNode).id === node.id)
    );
    if (!hasVisibleEdge && node.type === "actor") {
      ctx.globalAlpha = 0.15;
    }

    if (node.type === "store") {
      const size = 24 + Math.min(node.activityCount * 0.5, 12);
      const half = size / 2;

      // Shadow for stores
      if (!dimmed) {
        ctx.shadowColor = storeBorder;
        ctx.shadowBlur = isHovered ? 12 : 4;
      }

      roundRect(ctx, node.x - half, node.y - half, size, size, 6);
      ctx.fillStyle = storeBg;
      ctx.fill();
      ctx.strokeStyle = storeBorder;
      ctx.lineWidth = isHovered ? 2.5 : 1.5;
      ctx.stroke();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Initials
      ctx.fillStyle = storeBorder;
      ctx.font = `bold ${Math.max(9, size * 0.38)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.initials, node.x, node.y);
    } else {
      const radius = 14 + Math.min(node.activityCount * 0.3, 6);

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = actorBg;
      ctx.fill();
      ctx.strokeStyle = isHovered ? fg : mutedFg;
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Initials
      ctx.fillStyle = fg;
      ctx.font = `500 ${Math.max(8, radius * 0.7)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.initials, node.x, node.y);
    }

    // Label below node
    if (transform.k > 0.5) {
      const labelY = node.type === "store"
        ? node.y + 24 + Math.min(node.activityCount * 0.5, 12) / 2
        : node.y + 14 + Math.min(node.activityCount * 0.3, 6) + 6;
      ctx.fillStyle = mutedFg;
      ctx.font = `400 ${Math.round(10 / Math.max(transform.k, 0.7))}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const labelText =
        node.label.length > 14
          ? node.label.slice(0, 13) + "\u2026"
          : node.label;
      ctx.fillText(labelText, node.x, labelY);
    }

    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

export function findNodeAtPoint(
  canvasX: number,
  canvasY: number,
  nodes: GraphNode[],
  transform: Transform
): GraphNode | null {
  const gx = (canvasX - transform.x) / transform.k;
  const gy = (canvasY - transform.y) / transform.k;

  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    const radius = node.type === "store" ? 28 : 20;
    const dx = (node.x || 0) - gx;
    const dy = (node.y || 0) - gy;
    if (dx * dx + dy * dy < radius * radius) {
      return node;
    }
  }
  return null;
}
