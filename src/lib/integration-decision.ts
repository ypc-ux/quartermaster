/**
 * Integration Decision Engine — Business Integration Protocol
 * 5 dimensions: productivity(25) + tech debt(25) + fit(20) + effort(20) + ROI(10) = 100
 * Score → ≥75 = "Should we add [X]?" → you approve → wire it in
 */

export interface IntegrationCandidate {
  name: string; url: string; description: string;
  language: string; license: string;
  maturity: 'alpha' | 'beta' | 'stable' | 'mature';
  lastUpdated: string; activeMaintenance: boolean; stars: number;
  dependencies: string[]; buildType: string; testCoverage: boolean;
  securityIssues: boolean; problemItSolves: string; alternatives: string[];
  integrationComplexity: 'easy' | 'moderate' | 'complex';
  teamFamiliarity: 'never' | 'used_before' | 'expert';
  businessDomain: string;
}

export interface ScoreBreakdown {
  productivity: number; techDebt: number; businessFit: number;
  effort: number; roi: number; total: number;
  reasoning: Record<string, string>;
}

export interface IntegrationDecision {
  candidate: IntegrationCandidate;
  score: ScoreBreakdown;
  decision: 'INTEGRATE_IMMEDIATELY' | 'INTEGRATE_SOON' | 'CONSIDER_LATER' | 'NOT_RECOMMENDED';
  recommendation: string;
  powerMovesHit: string[];
  estimatedHours: number;
  estimatedHoursSaved: number;
}

// ── Scoring Functions ────────────────────────────────────────────────────────
function sProductivity(c: IntegrationCandidate): [number, string] {
  let s = 0; const r: string[] = [];
  const d = c.businessDomain;
  if (d === 'agent-platform' || d === 'automation') { s += 10; r.push('Saves 3+ hrs/wk'); }
  else if (d === 'ui-components' || d === 'design') { s += 8; r.push('Saves 2-3 hrs/wk'); }
  else if (d === 'research' || d === 'data') { s += 7; r.push('Saves 1-2 hrs/wk'); }
  else { s += 4; r.push('Moderate savings'); }
  if (c.language === 'TypeScript' || c.language === 'JavaScript') { s += 5; r.push('Direct TS reuse'); }
  else if (c.language === 'Python') { s += 3; r.push('Needs API layer'); }
  else { s += 1; r.push('Needs wrapper'); }
  s += (c.alternatives?.length ?? 0) < 3 ? 5 : 3;
  s += c.testCoverage ? 3 : 1;
  s += c.stars > 100 ? 2 : 1;
  return [Math.min(s, 25), r.join('; ')];
}

function sTechDebt(c: IntegrationCandidate): [number, string] {
  let s = 0; const r: string[] = [];
  if (c.testCoverage && c.maturity === 'stable') { s += 10; r.push('Tested + stable'); }
  else if (c.testCoverage) { s += 7; r.push('Tested, moderate maturity'); }
  else if (c.maturity === 'stable') { s += 5; r.push('Mature, no tests'); }
  else { s += 2; r.push('Alpha/beta, no tests'); }
  if (c.activeMaintenance && c.stars > 50) { s += 8; r.push('Active + adopted'); }
  else if (c.activeMaintenance) { s += 5; r.push('Maintained, low adoption'); }
  else { s += 2; r.push('Stale'); }
  s += (c.dependencies?.length ?? 0) < 5 ? 4 : (c.dependencies?.length ?? 0) < 15 ? 2 : 1;
  s += c.securityIssues ? 1 : 3;
  return [Math.min(s, 25), r.join('; ')];
}

function sBusinessFit(c: IntegrationCandidate): [number, string] {
  let s = 0; const r: string[] = [];
  if (['agent-platform','observability','evaluation','ui-components'].includes(c.businessDomain)) { s += 10; r.push('Core to platform'); }
  else { s += 4; r.push('Peripheral fit'); }
  const desc = (c.description || '').toLowerCase();
  if (desc.includes('mcp') || desc.includes('agent') || desc.includes('eval')) { s += 6; r.push('Strategic: agent/MCP'); }
  else { s += 3; r.push('Some strategic value'); }
  s += (c.problemItSolves || '').toLowerCase().includes('user') ? 4 : 2;
  return [Math.min(s, 20), r.join('; ')];
}

function sEffort(c: IntegrationCandidate): [number, string] {
  let s = 0; const r: string[] = [];
  if (c.integrationComplexity === 'easy') { s += 10; r.push('Easy, plug-and-play'); }
  else if (c.integrationComplexity === 'moderate') { s += 6; r.push('Moderate, needs custom'); }
  else { s += 3; r.push('Complex, significant work'); }
  if (c.language === 'TypeScript' || c.language === 'JavaScript') { s += 5; r.push('Native TS/JS'); }
  else if (c.language === 'Python') { s += 3; r.push('Python, needs bridge'); }
  else { s += 1; r.push('Needs wrapper'); }
  s += c.teamFamiliarity === 'expert' ? 5 : c.teamFamiliarity === 'used_before' ? 3 : 1;
  return [Math.min(s, 20), r.join('; ')];
}

function sROI(c: IntegrationCandidate): [number, string] {
  let s = 0; const r: string[] = [];
  const hrsSaved = { 'agent-platform': 200, 'ui-components': 100, 'research': 80 }[c.businessDomain] ?? 40;
  const hrs = c.integrationComplexity === 'easy' ? 8 : c.integrationComplexity === 'moderate' ? 24 : 80;
  const ratio = hrsSaved / hrs;
  s += ratio >= 10 ? 6 : ratio >= 4 ? 4 : ratio >= 2 ? 2 : 1;
  r.push(`ROI ${ratio.toFixed(1)}:1`);
  if (c.businessDomain === 'agent-platform') { s += 4; r.push('Platform moat'); }
  else { s += 2; r.push('Some strategic value'); }
  return [Math.min(s, 10), r.join('; ')];
}

// ── Decision Engine ──────────────────────────────────────────────────────────
export function scoreIntegration(c: IntegrationCandidate): IntegrationDecision {
  const [ps, pr] = sProductivity(c); const [td, tr] = sTechDebt(c);
  const [bf, br] = sBusinessFit(c); const [ef, er] = sEffort(c); const [ri, rr] = sROI(c);
  const total = ps + td + bf + ef + ri;
  let decision: IntegrationDecision['decision'];
  if (total >= 80) decision = 'INTEGRATE_IMMEDIATELY';
  else if (total >= 70) decision = 'INTEGRATE_SOON';
  else if (total >= 50) decision = 'CONSIDER_LATER';
  else decision = 'NOT_RECOMMENDED';
  const rec = decision === 'INTEGRATE_IMMEDIATELY' ? `Score ${total}/100 — High value, low risk. Immediate integration.`
    : decision === 'INTEGRATE_SOON' ? `Score ${total}/100 — Good value. Next sprint.`
    : decision === 'CONSIDER_LATER' ? `Score ${total}/100 — Some value. Revisit later.`
    : `Score ${total}/100 — Low value or high risk. Decline.`;
  const pm: string[] = [];
  const desc = (c.description || '').toLowerCase();
  if (desc.includes('agent') || desc.includes('mcp')) pm.push('App store');
  if (c.businessDomain === 'agent-platform') pm.push('Network effects');
  if (c.businessDomain === 'ui-components') pm.push('Generosity');
  if (desc.includes('api') || desc.includes('sdk')) pm.push('API-first');
  const hrsSaved = { 'agent-platform': 200, 'ui-components': 100, 'research': 80 }[c.businessDomain] ?? 40;
  const hrs = c.integrationComplexity === 'easy' ? 8 : c.integrationComplexity === 'moderate' ? 24 : 80;
  return {
    candidate: c,
    score: { productivity: ps, techDebt: td, businessFit: bf, effort: ef, roi: ri, total,
      reasoning: { productivity: pr, techDebt: tr, businessFit: br, effort: er, roi: rr } },
    decision, recommendation: rec, powerMovesHit: pm, estimatedHours: hrs, estimatedHoursSaved: hrsSaved,
  };
}

export function formatDecision(d: IntegrationDecision): string {
  const e = d.decision === 'NOT_RECOMMENDED' ? '❌' : d.decision === 'CONSIDER_LATER' ? '⚠️' : '✅';
  return `${e} ${d.candidate.name} — ${d.score.total}/100\n${d.recommendation}\n\nProductivity: ${d.score.productivity}/25 — ${d.score.reasoning.productivity}\nTech Debt:    ${d.score.techDebt}/25 — ${d.score.reasoning.techDebt}\nBusiness Fit: ${d.score.businessFit}/20 — ${d.score.reasoning.businessFit}\nEffort:       ${d.score.effort}/20 — ${d.score.reasoning.effort}\nROI:          ${d.score.roi}/10 — ${d.score.reasoning.roi}\n\nPower moves: ${d.powerMovesHit.join(', ') || 'none'}\nEst: ${d.estimatedHours}h to integrate, ${d.estimatedHoursSaved}h/yr saved`;
}