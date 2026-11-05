# GEMINI.md — Repository Instructions for Gemini Coding Agent

You are implementing English Game Hub MVP. Primary language of communication: Vietnamese; code identifiers in English. First read `docs/README.md` and `docs/AI_WORKFLOW.md`. Product requirements are authoritative; if docs conflict, pause and ask for clarification.

## Mandatory workflow
- Work on exactly one task ID from `docs/TASK_BACKLOG.md` per request.
- Before coding: inspect repository, summarize understanding, list files and tests, ask approval if task has architectural uncertainty.
- During coding: minimal scoped diff; no unrelated refactor.
- After coding: run relevant lint/typecheck/tests/build where available; report actual results; do not claim success without execution.
- Update task status only with reviewer approval.

## Stack
Next.js App Router, TypeScript strict, Tailwind CSS, Supabase Auth/Postgres/Storage, Zod, React mini games. Prefer server-side evaluation and transactional XP. No Phaser, free-form AI conversation, multiplayer or payments in MVP.

## Security
Never expose Supabase service-role key, correct answers, private rubrics, secrets or user data. Validate auth and authorization on server, enable/test RLS, make scoring idempotent, sanitize/validate input, rate-limit mutations.

## First action
Read task T-001 and propose implementation steps. Do not code before user requests implementation.
