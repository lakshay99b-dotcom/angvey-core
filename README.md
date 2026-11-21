# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 28 (21 Nov 2026) — Action Approval & Side-Effect Packets: Kill the Irreversible Action Uncertainty Tax

Attacked the residual irreversible-action uncertainty tax: as solopreneurs adopt personal agents that can take real actions (send emails, fill forms, book, update records, publish), they face fear of wrong side-effects, constant verification overhead, and no lightweight portable packet that forces declaration of planned actions, flags irreversible ones, batches explicit approvals, and captures post-action evidence. Memory tools and skill cards capture prefs; few force this approval + verification loop in one paste.

**Problem attacked:** Irreversible action uncertainty / excessive-agency tax. Inspired by n8n-io/nod (Apache-2.0 local personal agent with own browser that asks before acting), agent failure indices showing missing approval gates on destructive tools, and OWASP-style excessive agency risks. One-click packet lists next actions, heuristically flags irreversible keywords, separates approval batch, and instructs agent to wait for human OK on those only, then log verification.

**What shipped:**
- Storage bumped to v28 (auto-loads v27–v8)
- New Action Approval & Side-Effect Packets: one-click generates markdown with open next-actions, flagged irreversible ones, compact approval list, and strict instructions to declare plans, wait on irreversible, auto-proceed on reversible, and append verification/evidence log
- Button in Daily Brief next to Preference Drift Check
- Subtitle, export version, and vision updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 27 Preference Drift Check Packets. Previous: Restart Resume, Judgment Drain, Grill-Before-Act, Compliance Audit Packets, Weekly Invoice Narratives, Mid-Day Resume, Day-Close/Start, Client-Ready Receipts, Finish Evidence, Next-Action Prompts, Client Resume, Portable Skill Cards.

## How to run
```bash
npm install
npm run dev
```
Deploy on Vercel: connect this repo (zero config). Suggested project name: angvey-finisher or angvey-core.

## Vision
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds or draft rework. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers. Portable skill cards, live Resume Packets, Next-Action Finish Prompts, Finish Evidence Packets, Client-Ready Finish Receipts, Day-Start Finish Packets, Day-Close Finish Packets, Mid-Day Resume Packets, Weekly Invoice Narrative Packets, Compliance Audit Packets, Grill-Before-Act Packets, Judgment Drain Packets, Session Outcome Capture Packets, Skill Lock Packets, Restart Resume Packets, Preference Drift Check Packets, and Action Approval & Side-Effect Packets make the memory and work state usable across any agent.
