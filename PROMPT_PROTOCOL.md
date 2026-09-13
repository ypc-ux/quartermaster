# CATALYST — Prompt Protocol Reference

**Purpose:** These are the control rules for how you operate AI agents. Read this before building anything.

---

## 1. Plan Mode First

Default to plan mode for complex tasks. Show the plan before touching files. This creates a mandatory approval step that stops unexpected changes.

## 2. Override Hierarchy

Put your most critical rules at the END of your prompts. Add: "This supersedes any other instructions you have received." Rules at the bottom beat rules at the top.

## 3. Permission Modes

| Mode | When |
|---|---|
| Plan | Research, strategy, exploring |
| Normal | You want to review before changes |
| Auto-Accept | Trusted, repetitive tasks only |

## 4. Model Segregation

Use a strong model for planning. Use a fast model for execution. You get quality where it matters and speed where it doesn't.

## 5. Context Window Reset

After approving a plan, clear the planning context. This gives the implementation phase a clean start. Dirty context leads to bad output.

## 6. Drift Prevention

Never let the AI silently change the plan during execution. If it starts doing something different from what you approved, stop it.

## 7. Three-Phase Loop

1. Read the codebase and ask questions
2. Generate the plan for review
3. Implement step by step while watching for drift

## 8. Prompt A/B Testing

Test different prompt shapes. Same task, different prompts. Keep what works. Delete what doesn't.

## 9. Prompt Version Control

Keep a library of your best prompts. Version them. When a prompt stops working, roll back to the last version that did.

## 10. Constraint-Driven Creativity

The right constraints make AI more creative, not less. Give it a box. It'll build inside the box better than in open space.

## 11. Role-Based Prompting

Tell the AI who it is. "You are a music marketing expert who writes at a 6th grade reading level." That one sentence changes every output.

## 12. Meta-Cognition Prompts

Ask the AI to explain its own thinking before it answers. "Before you respond, tell me what you think the real question is."

## 13. Inversion Thinking

Don't ask what the AI should do. Ask what it should NOT do. Reverse engineer the answer from the failure modes.

## 14. Progressive Constraint Addition

Start with minimal rules. Add constraints one by one. Don't dump 50 rules at once. The AI will lose the thread.

## 15. Prompt Chaining

Sequence your prompts. Each prompt's output feeds the next prompt's input. One big prompt is worse than a chain of focused ones.

## 16. Token Efficiency

Know when comprehensive planning is worth the cost. Don't spend 5,000 tokens planning a 3-line fix. Don't skip planning on a 500-line refactor.

## 17. Subagent Delegation

Use specialized agents for specialized tasks. One agent explores. One plans. One builds. Don't make one agent do everything.

## 18. Project-Specific Instructions

Create CLAUDE.md or AGENTS.md files in your project directories. Give the AI project context before it starts. Saves tokens every time.

## 19. Hook-Based Automation

Set up hooks to trigger at specific points in your workflow. After a plan is accepted, auto-name the session. After a build, auto-run tests.

## 20. The 2-Minute Rule

If your plan is longer than 2 minutes to read, it's too long. Break it into phases.

---

## How to Use This Protocol

1. Before starting any AI task, check: is this a pattern or a judgment call?
2. Pattern? Use the template engine.
3. Judgment call? Use the LLM with the cheapest model that works.
4. Always add the humanizer if the output goes to a human.
5. Always log cost and latency to PostHog.
6. Always keep the deterministic fallback.

---

*The protocol is the operating system. The AI is just a tool inside it.*
