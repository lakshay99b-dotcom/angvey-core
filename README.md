# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 25 (17 Nov 2026) — Skill Lock Packets: Kill the Rule Amnesia Tax

Attacked the residual rule-amnesia tax: even after Judgment Drain and Skill Cards, agents (and humans) gradually ignore, weaken, or re-negotiate previously locked client rules and preferences because nothing forces explicit acknowledgment of the active locked set at the start of high-stakes work. Context decays, and the next session starts colder.

**Problem attacked:** Rule and preference decay. Inspired by exploding Agent Skills packaging (anthropics/skills, mattpocock/skills, ECC, superpowers) and persistent-memory patterns (claude-mem). Few lightweight tools deliver a one-paste packet that forces any agent to confirm and lock the current high-score rules + prefs before proceeding.

**What shipped:**
- Storage bumped to v25 (auto-loads v24–v8)
- New Skill Lock Packets: one-click generates markdown listing only locked high-score rules and preferences for the filtered client (or top open task), with strict instructions for any agent to acknowledge each one it will obey and never re-ask or weaken them without explicit override
- Buttons in Daily Brief and Skill Cards section
- Subtitle, export version, and vision updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 24 Session Outcome Capture Packets. Previous: Judgment Drain, Grill-Before-Act, Compliance Audit Packets, Weekly Invoice Narratives, Mid-Day Resume, Day-Close/Start, Client-Ready Receipts, Finish Evidence, Next-Action Prompts, Client Resume, Portable Skill Cards.

## How to run
```bash
npm install
npm run dev
```
Deploy on Vercel: connect this repo (zero config). Suggested project name: angvey-finisher or angvey-core.

## Vision
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds or draft rework. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers. Portable skill cards, live Resume Packets, Next-Action Finish Prompts, Finish Evidence Packets, Client-Ready Finish Receipts, Day-Start Finish Packets, Day-Close Finish Packets, Mid-Day Resume Packets, Weekly Invoice Narrative Packets, Compliance Audit Packets, Grill-Before-Act Packets, Judgment Drain Packets, Session Outcome Capture Packets, and Skill Lock Packets make the memory and work state usable across any agent.
