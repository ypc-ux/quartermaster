import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 300;

interface TreeEntry { path: string; type: "blob" | "tree"; size?: number }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  if (!owner || !repo) {
    return NextResponse.json({ error: "owner and repo required" }, { status: 400 });
  }
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
    return NextResponse.json({ error: "invalid owner/repo" }, { status: 400 });
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, {
    headers,
    next: { revalidate: 300 },
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    return NextResponse.json({ error: `GitHub API ${r.status}`, detail: body.slice(0, 200) }, { status: r.status });
  }
  const data = await r.json();
  const tree: TreeEntry[] = (data.tree || [])
    .filter((e: any) => e.type === "blob" || e.type === "tree")
    .filter((e: any) => !/node_modules|\.next|dist|build|\.git\/|package-lock|yarn\.lock/.test(e.path))
    .slice(0, 400);

  return NextResponse.json({ owner, repo, tree, truncated: !!data.truncated, count: tree.length });
}
