# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 34 (27 Nov 2026) — Research Grounding Packets: Kill the Manual Research Paste Tax

Attacked the Manual Research Paste Tax: agents either hallucinate on current web data (pricing, competitors, news, docs) or force solopreneurs to manually search, copy, and paste sources every session. Firecrawl (trending +1k stars/day) and Agent-Reach give coding agents eyes on the web; solopreneurs lack a one-click grounding protocol that works with or without tools.

**Problem attacked:** Manual Research Paste Tax. One-click generates a Research Grounding Packet with suggested queries, strict cite-every-fact protocol (URL + snippet), confidence rules, and structured output. Paste into any agent. Inspired by Firecrawl skills (search/scrape/cite), evidence-before-claims, and Agent-Reach patterns.

**What shipped:**
- Storage bumped to v34 (auto-loads v33–v8)
- New Research Grounding Packet button in Daily Brief
- Generates packet with boot view, suggested queries, grounding protocol, source citation requirements, confidence rules
- Subtitle, export version updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 33 Methodology Lock / SKILL.md Packets. Previous: Verification Burden, Cognitive Load, Session Continuity, Attention Residue, Action Approval, Preference Drift Check, Restart Resume, Judgment Drain, Grill-Before-Act, Compliance Audit, Weekly Invoice Narratives, Mid-Day Resume, Day-Close/Start, Client-Ready Receipts, Finish Evidence, Next-Action Prompts, Client Resume, Portable Skill Cards.

## How to run
```bash
npm install
npm run dev
```
Deploy on Vercel: connect this repo (zero config). Suggested project name: angvey-finisher or angvey-core.

## Vision
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds, draft rework, verification tax, methodology drift, or research paste tax. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers. Portable skill cards and one-click packets (including Verification Burden Killer, Methodology Lock SKILL.md, and Research Grounding) make memory, discipline, and work state usable across any agent.
