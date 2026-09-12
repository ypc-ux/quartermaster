"use client";
import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import RepoInput from "@/components/whiteboard/RepoInput";
import { parseGitHubUrl, buildRepoGraph, type GraphNode, type GraphEdge } from "@/lib/github";
import { ARSENAL, ARSENAL_EDGES, GROUP_META, TOTAL_PTS, type Group } from "@/lib/arsenal-graph";
import { layoutArsenal, arsenalEdges, layoutRepo } from "@/lib/layout";

const GraphCanvas = dynamic(() => import("@/components/whiteboard/GraphCanvas"), { ssr: false });

type Mode = "arsenal" | "repo";

interface RepoState {
  owner: string;
  repo: string;
  count: number;
  truncated?: boolean;
}

export default function WhiteboardPage() {
  const [mode, setMode] = useState<Mode>("arsenal");
  const [url, setUrl] = useState("ypc-ux/quartermaster-agents");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repoInfo, setRepoInfo] = useState<RepoState | null>(null);
  const [repoNodes, setRepoNodes] = useState<any[]>([]);
  const [repoEdges, setRepoEdges] = useState<any[]>([]);

  const arsenalNodes = useMemo(() => layoutArsenal(ARSENAL), []);
  const arsenalFlowEdges = useMemo(() => arsenalEdges(), []);

  async function loadRepo(value: string) {
    setError(null);
    const parsed = parseGitHubUrl(value);
    if (!parsed) { setError("Not a valid GitHub URL. Try owner/repo"); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/repo?owner=${encodeURIComponent(parsed.owner)}&repo=${encodeURIComponent(parsed.repo)}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to fetch");
      const graph = buildRepoGraph(data.tree);
      const { nodes, edges } = layoutRepo(graph);
      setRepoNodes(nodes);
      setRepoEdges(edges);
      setRepoInfo({ owner: data.owner, repo: data.repo, count: data.count, truncated: data.truncated });
      setMode("repo");
    } catch (e: any) {
      setError(e.message || "Failed to load repo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="h-screen w-screen flex flex-col bg-navy overflow-hidden">
      {/* Top bar */}
      <header className="shrink-0 border-b border-white/5 bg-navy-dark/80 backdrop-blur px-6 py-3 flex items-center gap-6 z-10">
        <Link href="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-1.5 transition">
          <span>←</span> Command Center
        </Link>
        <div className="flex items-baseline gap-2">
          <h1 className="text-white text-lg font-semibold" style={{ fontFamily: "Instrument Serif, serif" }}>Whiteboard</h1>
          <span className="text-slate-500 text-xs">· visualize any repo or the full arsenal</span>
        </div>
        <div className="flex-1 max-w-2xl ml-auto">
          <RepoInput value={url} onChange={setUrl} onSubmit={loadRepo} loading={loading} />
        </div>
      </header>

      {/* Mode tabs */}
      <div className="shrink-0 flex items-center gap-1 px-6 pt-3">
        <button
          onClick={() => setMode("arsenal")}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${mode === "arsenal" ? "bg-gold/15 text-gold border border-gold/30" : "text-slate-400 border border-transparent hover:text-white"}`}
        >
          System Map · {ARSENAL.length} agents · {TOTAL_PTS} pts
        </button>
        <button
          onClick={() => { if (repoNodes.length) setMode("repo"); }}
          disabled={!repoNodes.length}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${mode === "repo" ? "bg-gold/15 text-gold border border-gold/30" : "text-slate-400 border border-transparent hover:text-white disabled:opacity-40 disabled:hover:text-slate-400"}`}
        >
          Repo{repoInfo ? ` · ${repoInfo.owner}/${repoInfo.repo} · ${repoInfo.count} files` : ""}
        </button>
        {error && <div className="ml-4 text-xs text-red-400">{error}</div>}
      </div>

      {/* Legend */}
      <div className="shrink-0 px-6 py-2 flex items-center gap-4 text-[11px] text-slate-400">
        {(Object.keys(GROUP_META) as Group[]).map(g => (
          <div key={g} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: GROUP_META[g].color }} />
            <span>{GROUP_META[g].label}</span>
          </div>
        ))}
        <span className="ml-auto text-slate-500">Drag nodes · scroll to zoom · click + drag canvas to pan</span>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0">
        {mode === "arsenal" ? (
          <GraphCanvas
            nodes={arsenalNodes}
            edges={arsenalFlowEdges}
            mode="arsenal"
            title="Quartermaster — Agent Arsenal"
            subtitle={`${ARSENAL.length} connected agents · ${TOTAL_PTS} challenge points · one operating system`}
          />
        ) : (
          <GraphCanvas
            nodes={repoNodes}
            edges={repoEdges}
            mode="repo"
            title={repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : "Repository"}
            subtitle={repoInfo ? `${repoInfo.count} files${repoInfo.truncated ? " (truncated)" : ""} · drag to explore` : ""}
          />
        )}
      </div>
    </main>
  );
}
