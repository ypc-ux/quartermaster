"use client";
import { useMemo } from "react";
import {
  ReactFlow, Background, Controls, MiniMap, Panel,
  type Node, type Edge, type NodeProps, BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GROUP_META, type Group } from "@/lib/arsenal-graph";

function FolderNode({ data }: NodeProps) {
  return (
    <div className="px-3 py-1.5 rounded-md border border-gold/40 bg-navy-light text-gold text-xs font-medium shadow-lg whitespace-nowrap">
      <span className="mr-1">📁</span>{String(data.label)}
    </div>
  );
}

function FileNode({ data }: NodeProps) {
  return (
    <div className="px-3 py-1 rounded border border-white/10 bg-white/[0.03] text-white/80 text-[11px] shadow whitespace-nowrap">
      <span className="mr-1 opacity-60">📄</span>{String(data.label)}
    </div>
  );
}

function AgentNode({ data }: NodeProps) {
  const group = (data.group as Group) || "content";
  const c = GROUP_META[group];
  const isCore = data.id === "core";
  return (
    <div
      className={`rounded-xl px-4 py-3 text-center shadow-xl border-2 min-w-[150px] transition-transform hover:scale-105 ${isCore ? "ring-2 ring-gold/50 ring-offset-2 ring-offset-navy" : ""}`}
      style={{ background: c.color, color: c.fg, borderColor: c.color }}
    >
      <div className={`font-semibold ${isCore ? "text-[15px]" : "text-[13px]"}`} style={{ fontFamily: "Instrument Serif, serif" }}>
        {String(data.label)}
      </div>
      <div className="text-[10px] opacity-90 mt-0.5">{String(data.desc)}</div>
      <div className="text-[11px] font-mono mt-1.5 bg-black/10 rounded px-2 py-0.5 inline-block">
        {String(data.pts)} pts
      </div>
    </div>
  );
}

const nodeTypes = { folder: FolderNode, file: FileNode, agent: AgentNode };

interface Props {
  nodes: Node[];
  edges: Edge[];
  mode: "arsenal" | "repo";
  title?: string;
  subtitle?: string;
}

export default function GraphCanvas({ nodes, edges, mode, title, subtitle }: Props) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      proOptions={{ hideAttribution: true }}
      defaultEdgeOptions={{ style: { stroke: "#c9a227", strokeOpacity: 0.5 } }}
      nodesDraggable
      nodesConnectable={false}
      minZoom={0.15}
      maxZoom={1.8}
    >
      <Background color="#c9a227" gap={24} size={1.2} variant={BackgroundVariant.Dots} />
      <Controls
        position="bottom-right"
        style={{ background: "#111d33", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
      />
      <MiniMap
        nodeColor={(n) => {
          const g = (n.data as any)?.group as Group | undefined;
          return g ? GROUP_META[g].color : "#c9a227";
        }}
        maskColor="rgba(11,20,38,0.85)"
        style={{ background: "#0B1426", border: "1px solid rgba(255,255,255,0.08)" }}
        position="top-right"
      />
      {title && (
        <Panel position="top-left">
          <div className="rounded-lg border border-white/10 bg-navy/80 backdrop-blur px-4 py-2.5 shadow-lg">
            <div className="text-white text-sm font-semibold" style={{ fontFamily: "Instrument Serif, serif" }}>{title}</div>
            {subtitle && <div className="text-slate-400 text-[11px] mt-0.5">{subtitle}</div>}
          </div>
        </Panel>
      )}
    </ReactFlow>
  );
}
