# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 21 (13 Nov 2026) — Compliance Audit Packets: Kill the Silent Rule-Drift Tax

Attacked the residual pre-delivery tax: after logging outcomes and generating skill cards / invoice narratives, solopreneurs still manually re-check whether recent AI-assisted work actually obeyed client rules and preferences. Silent drift leads to client rework, disputes, and lost trust. Task lists and raw logs do not force verification.

**Problem attacked:** Rule-enforcement and evidence-audit gaps compound when outcomes are not cross-checked against portable skills before shipping. Inspired by trending agent skills (structured rule/outcome patterns from anthropics/skills, ECC harness memory/security), documented agent failure modes (evidence present but not acted on), and compliance-first patterns. Few lightweight tools turn last-7-days outcomes + rules into a one-paste audit packet that forces an agent to flag violations and produce a clean summary.

**What shipped:**
- Storage bumped to v21 (auto-loads v20–v8)
- New Compliance Audit Packets: one-click generates markdown listing relevant rules + recent outcomes, with precise instructions for any agent to audit, severity-flag deviations, and output only results
- Buttons in Daily Brief and Skill Cards section (scoped by client filter)
- Subtitle, export version updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 20 Weekly Invoice Narrative Packets. Previous: Mid-Day Resume, Day-Close/Start, Client-Ready Receipts, Finish Evidence, Next-Action Prompts, Client Resume, Portable Skill Cards, Reflect & Retain, verification checklists, due dates, structured handoffs, daily brief, memory types, priorities, import/export, focus mode.

## Day 20/21 (12 Nov 2026) — Weekly Invoice Narrative Packets: Kill the Billing Reconstruction Tax

Attacked the residual Friday tax: after a week of evidence logging, receipts, and finishes, solopreneurs still spend 20–40 minutes reconstructing verified outcomes into professional, billable-hour-justifying narratives for invoices, client portals, or status emails. Task lists and raw logs do not speak invoice language.

**Problem attacked:** Attention residue compounds when weekly progress is not closed into client-safe, invoice-ready packets. Inspired by trending agent skills (structured output patterns from anthropics/skills and addyosmani/agent-skills), persistent memory (claude-mem), and receipt/evidence patterns. Few lightweight tools turn last-7-days outcomes + open work into grouped invoice narratives with suggested line items.

**What shipped:**
- Storage bumped to v20 (auto-loads v19–v8)
- Full working zero-dependency app restored and extended (placeholder page.js replaced with complete implementation of prior packets + new feature)
- New Weekly Invoice Narrative Packets: one-click generates markdown grouping last 7 days of outcomes by client, open work, and suggested invoice lines — copies to clipboard
- Button in Daily Brief alongside Day-Start/Close/Mid-Day
- Subtitle, export version updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 19 Mid-Day Resume Packets. Previous: Day-Close Finish Packets, Day-Start Finish Packets, Client-Ready Finish Receipts, Finish Evidence Packets, Next-Action Finish Prompts, Client Resume Packets, Portable Skill Cards, Reflect & Retain, verification checklists, due dates, structured handoffs, daily brief, memory types, priorities, import/export, focus mode.

## How to run
```bash
npm install
npm run dev
```
Deploy on Vercel: connect this repo (zero config). Suggested project name: angvey-finisher or angvey-core.

## Vision
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds or draft rework. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers. Portable skill cards, live Resume Packets, Next-Action Finish Prompts, Finish Evidence Packets, Client-Ready Finish Receipts, Day-Start Finish Packets, Day-Close Finish Packets, Mid-Day Resume Packets, Weekly Invoice Narrative Packets, and Compliance Audit Packets make the memory and work state usable across any agent.
