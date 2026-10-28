# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 7 (28 Oct 2026) — Complete Finisher + Handoff Polish
Completed the truncated page.js into a fully working local-first app. Strengthened the solopreneur context-switch killer.

**Problem attacked:** Solopreneurs and freelancers lose hours to "AI brain fry" and attention residue when juggling multi-client work across different AI tools. Lightweight tools rarely give structured, client-scoped memory + one-click handoff prompts.

**What shipped:**
- Fully functional Next.js app (was truncated mid-function)
- Client-scoped memory with keyword recall on task creation
- Focus Mode (top 3 open tasks) + client filter
- Improved one-click Handoff Prompt (structured markdown with completed/remaining, issues, client memory)
- Export full state as JSON
- Storage key bumped to v7
- Cleaner UI polish, stats, activity log

Inspired by trending agent memory layers (claude-mem, mem0, hindsight), handoff patterns, and paperclip-style agent management — implemented as zero-dependency localStorage for instant deployability.

Previous days focused on the same core problem (persistent task completion + handoffs for attention bottleneck).

## How to run
```bash
npm install
npm run dev
```
Deploy on Vercel: connect this repo, zero config.

## Vision
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers.
