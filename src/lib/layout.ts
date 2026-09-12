import type { Node, Edge } from "@xyflow/react";
import type { Group, ArsenalNode } from "./arsenal-graph";
import { GROUP_META } from "./arsenal-graph";

export function layoutArsenal(nodes: ArsenalNode[]): Node[] {
  const core = nodes.find(n => n.id === "core");
  const others = nodes.filter(n => n.id !== "core");
  const radius = 520;
  const result: Node[] = [];
  if (core) {
    result.push({
      id: core.id,
      type: "agent",
      position: { x: 0, y: 0 },
      data: { ...core },
    });
  }
  others.forEach((n, i) => {
    const angle = (i / others.length) * Math.PI * 2 - Math.PI / 2;
    result.push({
      id: n.id,
      type: "agent",
      position: { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius },
      data: { ...n },
    });
  });
  return result;
}

export function arsenalEdges(): Edge[] {
  return ["stunt", "commander", "brainwash", "research", "trends", "launch",
    "twitter", "content", "vault", "hooks", "batch", "bio", "grid",
    "digest", "analytics", "finance", "collab", "community", "reset",
  ].map(id => ({
    id: `core→${id}`,
    source: "core",
    target: id,
    animated: id === "stunt",
    style: { stroke: GROUP_META.core.color, strokeOpacity: 0.6 },
  }));
}

interface PositionedFileNode extends Node {
  path: string;
}

export function layoutRepo(graph: { nodes: any[]; edges: any[] }): { nodes: Node[]; edges: Edge[] } {
  const byDepth = new Map<number, any[]>();
  for (const n of graph.nodes) {
    const depth = n.path === "/" ? 0 : (n.path.match(/\//g)?.length ?? 0) + 1;
    if (!byDepth.has(depth)) byDepth.set(depth, []);
    byDepth.get(depth)!.push(n);
  }
  const result: Node[] = [];
  for (const [depth, group] of byDepth) {
    const spacing = 170;
    const totalWidth = group.length * spacing;
    group.forEach((n, i) => {
      result.push({
        id: n.id,
        type: n.type,
        position: { x: i * spacing - totalWidth / 2 + spacing / 2, y: depth * 110 },
        data: { label: n.label, path: n.path, size: n.size },
      });
    });
  }
  const edges: Edge[] = graph.edges.map((e: any) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    style: { stroke: "#c9a227", strokeOpacity: 0.35 },
    type: "smoothstep",
  }));
  return { nodes: result, edges };
}
