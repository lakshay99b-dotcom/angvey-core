# angvey-core

**ANGVEY Core Product**  
Daily-evolving AI solution targeting the most unique and highly pinching problems in the world.

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

Inspired by durable approval + verifiable record patterns from open-multi-agent and adversarial verification ideas in agent fleets (Orca/Angy-style). Original implementation.

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
