# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 8 (29 Oct 2026) — Memory + Priority Polish
Strengthened the local-first finisher for solopreneurs juggling multiple AI agents and clients.

**Problem attacked:** Attention residue and fragmented client context when switching between ChatGPT / Claude / Grok / Codex sessions. Most agent memory layers (mem0, Letta, OpenClaw) are either heavy, cloud-locked, or not scoped for multi-client freelance work. Lightweight portable handoff + recall is still underserved.

**What shipped:**
- Storage bumped to v8
- Scored keyword recall (client boost + match count)
- Memory types (fact/pref/rule), search, delete
- Task priorities (high/normal/low) with visual badges and sort
- Import JSON alongside export
- Stats: open count + done-today
- CSS fixes for step statuses + priority badges
- Cleaner handoff prompt including priority

Inspired by trending memory layers (mem0 extraction/scoping patterns, OpenMemory MCP local-first) and skills frameworks, kept zero-dependency for instant Vercel deploy.

Previous days: completed the truncated app and focused on the same core problem (persistent task completion + handoffs for attention bottleneck).

## How to run
```bash
npm install
npm run dev
```
Deploy on Vercel: connect this repo, zero config.

## Vision
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers.
