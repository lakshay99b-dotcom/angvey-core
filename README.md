# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 9 (30 Oct 2026) — Due Dates, Structured Handoffs & Daily Brief
Strengthened the local-first finisher against the AI context-switch tax for multi-client solopreneurs.

**Problem attacked:** Attention residue and the hidden setup tax when switching between ChatGPT / Claude / Grok / Codex sessions across clients. Most memory layers are heavy or cloud-locked; lightweight portable, client-scoped handoffs with deadlines remain underserved.

**What shipped:**
- Storage bumped to v9 (loads v8 automatically)
- Due dates on tasks with overdue highlighting and sort priority
- Tags support
- Structured handoff prompts (progress %, recommended next atomic action, constraints, global prefs)
- Daily Brief card: top 3 open high-priority tasks with one-click handoff
- Visual progress bars
- Better recall scoring (boost rules/prefs)
- Empty state + stats including overdue count
- UI polish for dates and brief

Inspired by trending local-first handoff tools (memhandoff structured context, cross-agent-memory, agent-os hierarchy patterns) and the persistent "AI brain fry" / context switching literature. Kept zero-dependency for instant Vercel deploy.

Previous days: memory types, priorities, import/export, focus mode, one-click handoffs.

## How to run
```bash
npm install
npm run dev
```
Deploy on Vercel: connect this repo (zero config). Suggested project name: angvey-finisher or angvey-core.

## Vision
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers.
