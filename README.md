# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 29 (22 Nov 2026) — Attention Residue & Clean Handoff Packets: Kill the Unfinished-Thread Tax

Attacked the attention residue / decision-queue tax: solopreneurs running agents (or long sessions) leave unfinished threads that occupy working memory (attention residue, documented by Sophie Leroy). Agents also generate micro-decision queues that accumulate into approval fatigue. Existing packets cover specific taxes; none force explicit close-or-park to clear residue with a self-contained handoff. Inspired by attention-residue research, agent handoff best practices, and structured process patterns from skills frameworks (Superpowers-style mandatory steps, clean handoffs).

**Problem attacked:** Attention residue / unfinished-thread tax and decision-queue overload. One-click packet scores open tasks by residue risk (missing next action, low progress, age), recommends complete-or-park, and instructs the agent to either finish the atomic next step fully or produce a compact self-contained handoff paragraph so the human or next agent carries zero mental thread.

**What shipped:**
- Storage bumped to v29 (auto-loads v28–v8)
- New Attention Residue & Clean Handoff Packets: one-click generates markdown with scored open threads, close-or-park recommendations, and strict instructions to clear the highest-residue item via completion or self-contained handoff, batch remaining decisions, and log clearance
- Button in Daily Brief next to Action Approval
- Subtitle, export version, packet versions, and vision updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 28 Action Approval & Side-Effect Packets. Previous: Preference Drift Check, Restart Resume, Judgment Drain, Grill-Before-Act, Compliance Audit Packets, Weekly Invoice Narratives, Mid-Day Resume, Day-Close/Start, Client-Ready Receipts, Finish Evidence, Next-Action Prompts, Client Resume, Portable Skill Cards.

## How to run
```bash
npm install
npm run dev
```
Deploy on Vercel: connect this repo (zero config). Suggested project name: angvey-finisher or angvey-core.

## Vision
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds or draft rework. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers. Portable skill cards, live Resume Packets, Next-Action Finish Prompts, Finish Evidence Packets, Client-Ready Finish Receipts, Day-Start Finish Packets, Day-Close Finish Packets, Mid-Day Resume Packets, Weekly Invoice Narrative Packets, Compliance Audit Packets, Grill-Before-Act Packets, Judgment Drain Packets, Session Outcome Capture Packets, Skill Lock Packets, Restart Resume Packets, Preference Drift Check Packets, Action Approval & Side-Effect Packets, and Attention Residue & Clean Handoff Packets make the memory and work state usable across any agent.
