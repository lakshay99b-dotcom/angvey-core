# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 27 (19 Nov 2026) — Preference Drift Check Packets: Kill the Softening & Re-interpretation Tax

Attacked the residual preference-drift tax: agents start strong on locked rules and prefs but gradually soften, re-interpret edge cases, or ignore them over multi-step / multi-session work. Solopreneurs must constantly re-paste locks or correct output, draining finite judgment and compounding draft-rework. Persistent memory tools capture activity; skill packages ship behaviour; few lightweight one-paste packets force explicit re-grounding, conflict batching, and adherence logging before proceeding.

**Problem attacked:** Preference drift / softening tax. Inspired by claude-mem (cross-session memory), agent-skills packaging (anthropics/skills, mattpocock/skills), last30days-skill research patterns, and human-in-the-loop approval layers (withHuman, deliberate). One-click packet forces any agent to restate locks, flag true conflicts only, auto-proceed on matches, and emit a short adherence log.

**What shipped:**
- Storage bumped to v27 (auto-loads v26–v8)
- New Preference Drift Check Packets: one-click generates markdown listing active locks with dates, recent evidence, current focus, and strict instructions to restate + confirm, scan for drift risk, batch only true conflicts with recommended defaults, auto-proceed otherwise, and append adherence log
- Buttons in Daily Brief next to Judgment Drain / Restart Resume
- Subtitle, export version, and vision updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 26 Restart Resume Packets. Previous: Judgment Drain, Grill-Before-Act, Compliance Audit Packets, Weekly Invoice Narratives, Mid-Day Resume, Day-Close/Start, Client-Ready Receipts, Finish Evidence, Next-Action Prompts, Client Resume, Portable Skill Cards.

## How to run
```bash
npm install
npm run dev
```
Deploy on Vercel: connect this repo (zero config). Suggested project name: angvey-finisher or angvey-core.

## Vision
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds or draft rework. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers. Portable skill cards, live Resume Packets, Next-Action Finish Prompts, Finish Evidence Packets, Client-Ready Finish Receipts, Day-Start Finish Packets, Day-Close Finish Packets, Mid-Day Resume Packets, Weekly Invoice Narrative Packets, Compliance Audit Packets, Grill-Before-Act Packets, Judgment Drain Packets, Session Outcome Capture Packets, Skill Lock Packets, Restart Resume Packets, and Preference Drift Check Packets make the memory and work state usable across any agent.
