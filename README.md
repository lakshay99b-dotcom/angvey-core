# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 24 (16 Nov 2026) — Session Outcome Capture Packets: Kill the Post-Session Extraction Tax

Attacked the residual extraction tax: after an agent finishes work, solopreneurs still spend minutes re-reading the chat, distilling what was actually produced, deciding what is worth logging as an outcome or new rule, and manually pasting it into memory. Agents rarely output in a compact log-ready format, so evidence decays and the next session starts colder.

**Problem attacked:** Memory decay and rework compound when session results are not forced into structured, copy-paste-ready blocks. Inspired by trending persistent-memory patterns, verification/skills packaging (ECC, grill-me style), and durable agent handoffs. Few lightweight tools turn the end of any agent session into a one-paste packet that forces only NEW_OUTCOMES, NEW_RULES_OR_PREFS, and CONFIRMED_NEXT.

**What shipped:**
- Storage bumped to v24 (auto-loads v23–v8)
- New Session Outcome Capture Packets: one-click generates markdown with locked context + strict instructions for any agent to output only three compact structured blocks ready for the memory log
- Buttons in Daily Brief and Skill Cards section (scoped by client filter)
- Subtitle and export version updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 23 Judgment Drain Packets. Previous: Grill-Before-Act, Compliance Audit Packets, Weekly Invoice Narratives, Mid-Day Resume, Day-Close/Start, Client-Ready Receipts, Finish Evidence, Next-Action Prompts, Client Resume, Portable Skill Cards, Reflect & Retain, verification checklists, due dates, structured handoffs, daily brief, memory types, priorities, import/export, focus mode.

## How to run
```bash
npm install
npm run dev
```
Deploy on Vercel: connect this repo (zero config). Suggested project name: angvey-finisher or angvey-core.

## Vision
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds or draft rework. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers. Portable skill cards, live Resume Packets, Next-Action Finish Prompts, Finish Evidence Packets, Client-Ready Finish Receipts, Day-Start Finish Packets, Day-Close Finish Packets, Mid-Day Resume Packets, Weekly Invoice Narrative Packets, Compliance Audit Packets, Grill-Before-Act Packets, Judgment Drain Packets, and Session Outcome Capture Packets make the memory and work state usable across any agent.
