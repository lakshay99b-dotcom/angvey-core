# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 14 (4 Nov 2026) — Next-Action Finish Prompts: Kill the "What Next" Tax

Attacked the residual friction after resume packets: freelancers still spend minutes crafting the precise prompt for the single current atomic step, and agents frequently expand scope or skip verification instead of producing one small verifiable output.

**Problem attacked:** Even with live work state and skills, the "what exactly do I do next and how to force a tiny finished increment" tax remains. Inspired by trending persistent context (claude-mem), agent skills frameworks, and documented agent failure modes (unbounded execution without meaningful progress). Few tools deliver a one-paste hyper-focused prompt that constrains the agent to the current next action only.

**What shipped:**
- Storage bumped to v14 (auto-loads v13–v8)
- New Next-Action Finish Prompts: one-click generate ultra-focused markdown for the current running/pending step, including relevant rules and pending checks
- Buttons on Daily Brief and every task card — copies to clipboard for paste into any agent
- Instructions force smallest verifiable output + one-line VERIFICATION note, then stop
- Subtitle, empty states, and export version updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 13 Client Resume Packets. Previous: Portable Skill Cards, Reflect & Retain, verification checklists, due dates, structured handoffs, daily brief, memory types, priorities, import/export, focus mode.

## Day 13 (3 Nov 2026) — Client Resume Packets: Kill the Last Switch Residue

Attacked the residual client-switch tax that pure Skill Cards leave behind: freelancers still spend 5–15 minutes reconstructing *where they left off* (open tasks, next actions, pending checks) when jumping between 5–10 clients across AI tools.

**Problem attacked:** Session amnesia is partially solved by portable skills, but live work state does not travel. Inspired by trending persistent context tools (claude-mem, agent skills, Hindsight patterns) and the documented multi-client attention-residue literature. Most tools give static memory; few deliver a one-paste live resume of the client's current open work.

**What shipped:**
- Storage bumped to v13 (auto-loads v12–v8)
- New "Client Resume Packets" panel: one-click generate compact markdown bundling rules/prefs + recent outcomes + top open tasks with progress, next atomic action, and pending checks
- Packets copy to clipboard — paste into any agent to resume instantly
- Subtitle, empty states, and export version updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 12 Portable Skill Cards. Previous: Reflect & Retain, verification checklists, due dates, structured handoffs, daily brief, memory types, priorities, import/export, focus mode.

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
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds or draft rework. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers. Portable skill cards, live Resume Packets, and Next-Action Finish Prompts make the memory and work state usable across any agent.
