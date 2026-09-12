// Repo scorer — pure function: takes a GitHub file tree, returns challenge rubric score.

export interface TreeEntry { path: string; type: "blob" | "tree"; size?: number }

export interface ScoreResult {
  score: number; max: number; agents: number;
  categories: Record<string, { points: number; max: number; found: string[]; missing: string[] }>;
  grade: string; recommendations: string[];
}

function has(paths: string[], re: RegExp): boolean { return paths.some(p => re.test(p)); }

export function scoreRepo(tree: TreeEntry[]): ScoreResult {
  const paths = tree.map(t => t.path).filter(p => !/node_modules|\.next|dist|\.git\//.test(p));
  const agents = new Set(
    paths.filter(p => /\.(py|ts|js|sh)$/.test(p) && !/node_modules/.test(p))
      .map(p => p.split("/")[0])
  ).size;

  const cats: ScoreResult["categories"] = {
    qualifying: { points: 0, max: 10, found: [], missing: [] },
    complexity: { points: 0, max: 15, found: [], missing: [] },
    connection: { points: 0, max: 20, found: [], missing: [] },
    narrative: { points: 0, max: 15, found: [], missing: [] },
    evidence: { points: 0, max: 15, found: [], missing: [] },
  };

  const hasReadme = has(paths, /readme\.md$/i);
  const hasWorkflows = has(paths, /\.github\/workflows\//);
  const hasPipelines = has(paths, /(pipeline|workflow|pipeline_defs)/i);
  const hasBig = tree.filter(t => t.type === "blob" && (t.size || 0) > 4000).length >= 2;
  const hasOrch = has(paths, /(orchestrat|quartermaster|_index)\.(py|ts|js)$/i);
  const hasRegistry = has(paths, /(registry|agents\.json|superagent_challenge\.md)/i);
  const hasDigest = has(paths, /(digest|briefing|ops)/i);
  const hasChallengeDoc = has(paths, /(superagent_challenge|challenge)\.md/i);
  const hasData = has(paths, /\/data\//);
  const hasTracker = has(paths, /\.(xlsx|csv)$/);
  const hasScreens = has(paths, /\.(png|jpg|svg)$/);
  const hasTests = has(paths, /\/(test|tests|qa)\//);

  // Qualifying (10)
  if (agents >= 1 && hasReadme) { cats.qualifying.points = 10; cats.qualifying.found.push("Agent(s) + README"); }
  else cats.qualifying.missing.push(agents < 1 ? "No agent scripts" : "No README");

  // Complexity (15)
  let cp = 0;
  if (hasPipelines) { cp += 8; cats.complexity.found.push("Pipeline defs"); }
  if (hasWorkflows) { cp += 7; cats.complexity.found.push("CI workflows"); }
  if (hasBig) { cp += 5; cats.complexity.found.push("Multi-step scripts"); }
  if (!cp) cats.complexity.missing.push("No pipelines/workflows");
  cats.complexity.points = Math.min(15, cp);

  // Connection (20)
  let cn = 0;
  if (hasOrch) { cn += 10; cats.connection.found.push("Orchestrator"); } else cats.connection.missing.push("No orchestrator — add one CLI");
  if (hasRegistry) { cn += 5; cats.connection.found.push("Registry/agent list"); }
  if (hasDigest) { cn += 5; cats.connection.found.push("Cross-agent digest"); }
  if (cn < 5) cats.connection.missing.push("Agents don't talk to each other");
  cats.connection.points = Math.min(20, cn);

  // Narrative (15)
  if (hasChallengeDoc) { cats.narrative.points += 8; cats.narrative.found.push("Challenge doc"); } else cats.narrative.missing.push("No SUPERAGENT_CHALLENGE.md");
  if (hasReadme) cats.narrative.points += 7;
  cats.narrative.points = Math.min(15, cats.narrative.points);

  // Evidence (15)
  let ep = 0;
  if (hasData) { ep += 6; cats.evidence.found.push("Data receipts"); }
  if (hasTracker) { ep += 5; cats.evidence.found.push("Tracker spreadsheet"); }
  if (hasScreens) { ep += 2; cats.evidence.found.push("Screenshots"); }
  if (hasTests) { ep += 2; cats.evidence.found.push("Tests/QA"); }
  if (!ep) cats.evidence.missing.push("No receipts — add data/, tracker, screenshots");
  cats.evidence.points = Math.min(15, ep);

  const base = Object.values(cats).reduce((s, c) => s + c.points, 0);
  const bonus = Math.min(60, agents * 5);
  const score = Math.min(300, base + bonus);

  const recs: string[] = [];
  if (agents < 5) recs.push(`Build ${5 - agents} more agents — every documented agent scores.`);
  if (cats.connection.points < 10) recs.push("Add an orchestrator CLI that runs every agent — that's worth 10+ pts.");
  if (!hasChallengeDoc) recs.push("Add SUPERAGENT_CHALLENGE.md — the one-headline story is worth 8 pts.");
  if (!hasData && !hasTracker) recs.push("Log receipts: data/ outputs + a tracker. Claims must survive checking.");

  return {
    score, max: 300, agents,
    categories: cats,
    grade: score >= 250 ? "A+" : score >= 200 ? "A" : score >= 120 ? "B" : score >= 60 ? "C" : "D",
    recommendations: recs.slice(0, 3),
  };
}