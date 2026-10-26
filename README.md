# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

## Day 5 (26 Oct 2026) — Priority Focus Queue + Client Summaries
Solopreneurs stop drowning in unfinished multi-client work.

**Problem attacked:** Attention residue and the 80/0 rule — unfinished tasks (especially across clients) deliver zero value and compound cognitive load. Few lightweight tools rank open work by age/urgency and give a one-glance client summary while keeping memory isolated.

**What shipped:**
- Priority scoring on unfinished tasks (age + issues + client presence)
- Priority Focus Queue sorted by score, with Focus Top 3 mode
- Client Summary panel (open tasks + memory counts per client)
- Storage key bumped to v5
- createdAt timestamps for accurate aging

Inspired by agent memory patterns (claude-mem, hindsight) and real solopreneur pain around unfinished work + context switching. Original lightweight implementation — no external deps.

## Day 4 (25 Oct 2026) — Client-Scoped Memory + Unfinished Resume
Multi-client freelancers no longer mix contexts or abandon 80% work.

**Problem attacked:** Solopreneurs juggling 5–10 clients pay a hidden “context tax” reconstructing brand voice, pricing rules and past decisions in every new AI session. Shared memory mixes clients. Unfinished tasks (the 80% that deliver zero value) get abandoned. Few lightweight tools give client-isolated, auditable memory + one-click resume.

**What shipped:**
- Client/Project tagging on tasks and memories
- Scoped recall (client-specific first, then global)
- Unfinished / Resume Queue panel with one-click resume
- Client filter across tasks + memory
- Decision memories auto-tagged to client
- Storage key bumped to v4 (fresh start recommended for clean data)

Inspired by multi-agent memory patterns in ruflo / orca / paperclip and real solopreneur pain around context switching + unfinished work. Original lightweight implementation — no external deps.

## Day 3 (24 Oct 2026) — Memory Bank + Consistency Verifier
Persistent task agent now carries cross-task memory so solopreneurs stop re-explaining context.

**Problem attacked:** Agents (and humans) forget past decisions, client facts, pricing rules and brand preferences across sessions and tasks. This causes rework, inconsistent proposals, and attention residue. Few tools give freelancers a lightweight, local, auditable shared memory that agents actually recall.

**What shipped:**
- Persistent Memory Bank (localStorage) for facts, preferences and decisions
- Automatic recall of relevant memories on every new task (keyword match)
- Verifier step now flags missing context or possible inconsistency with past decisions
- Completing a task auto-logs a decision into memory
- Manual add + filter UI for the Memory Bank
- Export now includes memory + completed tasks
- Steps renamed to reflect recall → plan → execute → verify flow

Inspired by shared memory patterns in agent harnesses (ruflo, orca, agenticos) and the real solopreneur pain of "every agent starts from zero". Original lightweight implementation — no external deps.

## Day 2 (23 Oct 2026) — Durable Finisher with Verifier
Persistent task agent for solopreneurs and freelancers — now survives refresh and forces verification.

**Problem attacked:** Agents abandon multi-step work because they lack durable state, real blocking approvals, and recovery from partial failures. Demos succeed; real tasks die on refresh or quiet errors.

**What shipped:**
- localStorage persistence for tasks + audit log (survives refresh/close)
- Explicit Verifier step that can flag issues and pause for human notes
- Human feedback notes on approval gates (logged in audit)
- Timestamps on steps + richer audit trail
- One-click JSON export of completed work
- UI polish for feedback and status clarity

## Day 1 (22 Oct 2026) — ANGVEY Finisher
Persistent task agent for solopreneurs and freelancers.

**Problem attacked:** Solopreneurs lose hundreds of hours to admin and leave AI projects unfinished because agents lack durable progress tracking, approval gates, and clear audit trails.

**What shipped:**
- Next.js App Router foundation
- Interactive dashboard to launch multi-step tasks
- Simulated agent loop with step progress
- Explicit human approval gates
- Live audit log

## Run locally
```bash
npm install
npm run dev
```

## Deploy
Connect this repo to Vercel — Next.js is auto-detected. Existing project: angvey-core.  
Production URL: https://angvey-core.vercel.app

## Mission
1. Continuously scan trending open-source AI libraries.
2. Identify under-served high-pain problems.
3. Improve this product only.
4. Report + deploy every day.

Founder: @lakshay99b-dotcom  
Company: ANGVEY

GitHub: https://github.com/lakshay99b-dotcom/angvey-core
