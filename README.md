# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

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

## Day 19 (10 Nov 2026) — Mid-Day Resume Packets: Kill the Interruption Residue Tax

Attacked the residual mid-day tax: after a client call, email, or agent approval on another thread, freelancers lose 5–10 minutes reconstructing the exact atomic next action and rules for the interrupted high-leverage task. Day-start and day-close cover bookends; the in-flight switch remains expensive.

**Problem attacked:** Attention residue and decision fatigue from agent interruptions compound when the current thread state is not instantly portable. Inspired by trending persistent context (claude-mem), agent skills frameworks, and documented multi-agent oversight load. Few lightweight tools deliver a one-paste packet that forces resumption of only the single current next action after a switch.

**What shipped:**
- Storage bumped to v19 (auto-loads v18–v8)
- New Mid-Day Resume Packets: one-click generates compact markdown for the top open task with next atomic action, rules, pending checks, and recent evidence — explicitly framed as "resume after interruption"
- Button in Daily Brief next to Day-Start/Close — copies to clipboard for any agent
- Subtitle, export version updated
- Still zero-dependency, instant Vercel deploy

Builds on Day 18 Day-Close Finish Packets. Previous: Day-Start Finish Packets, Client-Ready Finish Receipts, Finish Evidence Packets, Next-Action Finish Prompts, Client Resume Packets, Portable Skill Cards, Reflect & Retain, verification checklists, due dates, structured handoffs, daily brief, memory types, priorities, import/export, focus mode.

## How to run
```bash
npm install
npm run dev
```
Deploy on Vercel: connect this repo (zero config). Suggested project name: angvey-finisher or angvey-core.

## Vision
Lightweight, production-ready tool that helps solopreneurs finish work without constant context rebuilds or draft rework. Eventually sellable as a focused "finish what you start" companion for AI-powered freelancers. Portable skill cards, live Resume Packets, Next-Action Finish Prompts, Finish Evidence Packets, Client-Ready Finish Receipts, Day-Start Finish Packets, Day-Close Finish Packets, Mid-Day Resume Packets, and Weekly Invoice Narrative Packets make the memory and work state usable across any agent.
