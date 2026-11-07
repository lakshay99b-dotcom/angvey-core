# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 17 (7 Nov 2026) — Day-Start Finish Packets: Kill the Morning Prioritization + Reload Tax

Attacked the residual morning tax: freelancers still spend 10–20 minutes deciding which unfinished client work to attack first and assembling the right context, even after Skill Cards, Resume Packets, Next-Action Prompts, Evidence, and Receipts.

**Problem attacked:** Attention residue + decision fatigue compounds the unfinished-work pile. Inspired by trending persistent context (claude-mem), agent skills, and computer-use tooling (vercel-labs/agent-desktop). Few lightweight tools deliver a single pasteable “start the highest-leverage increment now” packet that opens with a constrained next-action prompt.

**What shipped:**
- Storage bumped to v17 (auto-loads v16–v8)
- Completed previously truncated page into a fully working zero-dependency app (all prior features restored)
- New Day-Start Finish Packets: one-click generates compact markdown that opens with the full Next-Action prompt for the #1 open task (priority + overdue), then short resumes of #2/#3 + relevant rules
- Button in Daily Brief — copies to clipboard for any agent
- Subtitle, empty states, and export version updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 16 Client-Ready Finish Receipts. Previous: Finish Evidence Packets, Next-Action Finish Prompts, Client Resume Packets, Portable Skill Cards, Reflect & Retain, verification checklists, due dates, structured handoffs, daily brief, memory types, priorities, import/export, focus mode.

## Day 16 (6 Nov 2026) — Client-Ready Finish Receipts: Kill the Status Update Tax

Attacked the residual rewrite tax after evidence logging: freelancers still manually convert verified agent artifacts into professional, client-safe progress updates for email, Slack, or portals.

**Problem attacked:** False finishes are reduced by evidence packets, but the "how do I report this without oversharing internal process or spending 10 minutes rewriting" tax remains. Inspired by receipt/evidence patterns in agent verification literature and the need for shareable proof. Few tools turn logged outcomes + next step into a polished client note.

**What shipped:**
- Storage bumped to v16 (auto-loads v15–v8)
- New Client-Ready Finish Receipts: one-click generate clean markdown progress update from recent outcomes/evidence, current next action, progress, and rules
- Buttons on Daily Brief and every task card — copies to clipboard
- Client-safe language; retains evidence context without process leakage
- Subtitle, empty states, and export version updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 15 Finish Evidence Packets. Previous: Next-Action Finish Prompts, Client Resume Packets, Portable Skill Cards, Reflect & Retain, verification checklists, due dates, structured handoffs, daily brief, memory types, priorities, import/export, focus mode.

## Day 15 (5 Nov 2026) — Finish Evidence Packets: Kill the False Finish Tax

Attacked the false-finish / no-evidence gap that remains after Next-Action prompts: agents claim the atomic step is done but produce no inspectable artifact, forcing freelancers to re-prompt or rework.

**Problem attacked:** Multi-agent studies and handoff-debt research show verification failures and false finishes are common. Agents expand scope or declare success without a checkable output. Few tools deliver a one-paste prompt that forces the smallest verifiable artifact in a strict format, then lets you log the result as retained outcome.

**What shipped:**
- Storage bumped to v15 (auto-loads v14–v8)
- New Finish Evidence Packets: one-click generate ultra-focused prompt for the current running/pending step that demands only the smallest verifiable artifact + strict ARTIFACT / VERIFICATION format, then stop
- Buttons on Daily Brief and every task card — copies to clipboard
- Log Evidence action: paste agent output → retained as outcome memory (client-scoped) and optionally advances the step
- Subtitle, empty states, and export version updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 14 Next-Action Finish Prompts. Previous: Client Resume Packets, Portable Skill Cards, Reflect & Retain, verification checklists, due dates, structured handoffs, daily brief, memory types, priorities, import/export, focus mode.

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
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds or draft rework. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers. Portable skill cards, live Resume Packets, Next-Action Finish Prompts, Finish Evidence Packets, Client-Ready Finish Receipts, and Day-Start Finish Packets make the memory and work state usable across any agent.
