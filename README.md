# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 12 (2 Nov 2026) — Portable Client Skill Cards

Attacked the multi-tool context rebuild tax: freelancers using Claude Code, Grok, Codex, ChatGPT etc. still paste the same client rules every session.

**Problem attacked:** Session amnesia and handoffs stay inside one tool. No lightweight way to turn verified client rules/outcomes into a portable skill any agent harness can load. Inspired by trending agent skills (SKILL.md), Hindsight retain/recall/reflect, and claude-mem capture patterns.

**What shipped:**
- Storage bumped to v12 (auto-loads v11–v8)
- New "Portable Client Skill Cards" panel: one-click generate compact markdown from rules, prefs, and recent outcomes
- Skill cards copy to clipboard — paste as system prompt or SKILL.md into any agent
- Handoff prompts now point to the Skill Card for the client
- Subtitle and empty states updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 11 Reflect & Retain. Previous: verification checklists, due dates, structured handoffs, daily brief, memory types, priorities, import/export, focus mode.

## Day 11 (1 Nov 2026) — Reflect & Retain: Close the Outcome Feedback Loop

Attacked the "session amnesia" where verification outcomes and rework lessons never stick across AI sessions for multi-client freelancers.

**Problem attacked:** Agents and tools remember facts but rarely turn what failed or succeeded in a handoff into enforceable future rules. Inspired by trending Hindsight (retain/recall/reflect) and claude-mem capture patterns. Most memory stops at retrieval; few force reflection into the next prompt.

**What shipped:**
- Storage bumped to v11 (auto-loads v10/v9/v8)
- New "Reflect & Retain" action on every task: capture outcome → auto-adds as rule or outcome memory (client-scoped)
- Memory scoring boosts outcomes/rules
- Handoff prompt now includes recent outcomes & learned rules
- Extra Reflect step in task flow
- Outcome memory type added
- Subtitle updated

Still zero-dependency, instant Vercel deploy. Builds on Day 10 verification checklists.

Previous: verification checklists, due dates, structured handoffs, daily brief, memory types, priorities, import/export, focus mode.

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
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds or draft rework. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers. Portable skill cards make the memory usable across any agent.
