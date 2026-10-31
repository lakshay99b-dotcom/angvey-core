# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 10 (31 Oct 2026) — Verification Checklists & Rework Tax Reduction
Attacked the AI draft rework tax for multi-client solopreneurs.

**Problem attacked:** AI produces polished-looking drafts that still require heavy human rework because client voice, constraints, and quality bars are not persistently enforced across sessions. Most tools stop at memory recall; few force a verifiable checklist into the handoff.

**What shipped:**
- Storage bumped to v10 (auto-loads v9/v8)
- Auto-generated verification checks from recalled rules/prefs
- Manual add/toggle checks per task
- Handoff prompt now includes a must-pass Verification Checklist
- Recency + usage-count boosts in memory scoring
- Finish rate stat in header
- Checks progress shown in Daily Brief and task cards
- UI polish for checks

Inspired by trending local-first memory/handoff tools (ai-memory, memhandoff, MemPalace patterns) and the persistent rework/attention-residue literature. Kept zero-dependency for instant Vercel deploy.

Previous days: due dates, structured handoffs, daily brief, memory types, priorities, import/export, focus mode.

## How to run
```bash
npm install
npm run dev
```
Deploy on Vercel: connect this repo (zero config). Suggested project name: angvey-finisher or angvey-core.

## Vision
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds or draft rework. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers.
