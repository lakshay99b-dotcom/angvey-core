# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

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

## Mission
1. Continuously scan trending open-source AI libraries.
2. Identify under-served high-pain problems.
3. Improve this product only.
4. Report + deploy every day.

Founder: @lakshay99b-dotcom  
Company: ANGVEY

GitHub: https://github.com/lakshay99b-dotcom/angvey-core
