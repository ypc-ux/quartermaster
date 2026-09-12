export function parseGitHubUrl(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };
  const slashMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (slashMatch) return { owner: slashMatch[1], repo: slashMatch[2] };
  return null;
}

export interface GraphNode {
  id: string;
  type: "folder" | "file";
  label: string;
  path: string;
  size?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface RepoGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface TreeEntry { path: string; type: "blob" | "tree"; size?: number }

export function buildRepoGraph(tree: TreeEntry[]): RepoGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seen = new Set<string>(["root"]);
  nodes.push({ id: "root", type: "folder", label: "root", path: "/" });

  const sorted = [...tree].sort((a, b) => {
    if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  for (const entry of sorted) {
    const parts = entry.path.split("/");
    let parentId = "root";
    for (let i = 0; i < parts.length; i++) {
      const id = parts.slice(0, i + 1).join("/");
      if (!seen.has(id)) {
        const isFolder = i < parts.length - 1 || entry.type === "tree";
        nodes.push({
          id,
          type: isFolder ? "folder" : "file",
          label: parts[i],
          path: parts.slice(0, i + 1).join("/"),
          size: isFolder ? undefined : entry.size,
        });
        seen.add(id);
      }
      const edgeId = `${parentId}→${id}`;
      if (!edges.some(e => e.id === edgeId)) {
        edges.push({ id: edgeId, source: parentId, target: id });
      }
      parentId = id;
    }
  }
  return { nodes, edges };
}
