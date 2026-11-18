# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 26 (18 Nov 2026) — Restart Resume Packets: Kill the Agent Restart / Replay Tax

Attacked the residual restart/replay tax: when an agent session crashes, times out, or is interrupted mid-work, solopreneurs lose the exact committed progress. They must re-explain locks, re-list what was already done, and risk the agent redoing irreversible side effects or wasting tokens on completed steps. Durable-execution patterns (Temporal-style checkpoints, committed state) are heavy; few lightweight tools deliver a one-paste recovery packet.

**Problem attacked:** Agent restart / replay tax. Inspired by durable-execution and failure-recovery research for AI agents (step commits, reconcile side effects, resume from last trusted state) and the growing skill/memory packaging trend. One-click packet forces any agent to acknowledge completed work, resume only the next atomic action, and never blindly retry.

**What shipped:**
- Storage bumped to v26 (auto-loads v25–v8)
- New Restart Resume Packets: one-click generates markdown with committed DONE steps, progress, locked rules, recent evidence, next atomic action, and strict instructions to skip completed work, mark unknown side-effects, and resume cleanly
- Buttons in Daily Brief and Skill Cards section
- Subtitle, export version, and vision updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 25 Skill Lock Packets. Previous: Judgment Drain, Grill-Before-Act, Compliance Audit Packets, Weekly Invoice Narratives, Mid-Day Resume, Day-Close/Start, Client-Ready Receipts, Finish Evidence, Next-Action Prompts, Client Resume, Portable Skill Cards.

## How to run
```bash
npm install
npm run dev
```
Deploy on Vercel: connect this repo (zero config). Suggested project name: angvey-finisher or angvey-core.

## Vision
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds or draft rework. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers. Portable skill cards, live Resume Packets, Next-Action Finish Prompts, Finish Evidence Packets, Client-Ready Finish Receipts, Day-Start Finish Packets, Day-Close Finish Packets, Mid-Day Resume Packets, Weekly Invoice Narrative Packets, Compliance Audit Packets, Grill-Before-Act Packets, Judgment Drain Packets, Session Outcome Capture Packets, Skill Lock Packets, and Restart Resume Packets make the memory and work state usable across any agent.
