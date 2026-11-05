# MVP Implementation Plan — 6 Sprints

## Sprint 0 — Decisions & foundation
Confirm brand, auth method, media source and hosting budget; repository, CI, environment conventions, issue tracking. Freeze MVP scope.

## Sprint 1 — Foundation
Next.js App Router, TS strict, Tailwind, UI tokens, responsive AppShell, Supabase dev, migrations, Auth scaffold. Exit: lint/typecheck/build pass, routes render, secrets protected.

## Sprint 2 — Game Core
Question schemas, server-side evaluator, session lifecycle, idempotent scoring, result and feedback. Exit: unit/integration tests cover happy and adversarial paths.

## Sprint 3 — Four games
Picture Match, Memory Flip, Sentence Builder, Error Detective; library and topic filtering. Exit: 4 games pass keyboard/mobile tests and scoring.

## Sprint 4 — Listening & Roleplay
Listen & Choose, scripted branching Roleplay, media fallback, topic detail. Exit: audio and dialogue paths tested including failure cases.

## Sprint 5 — Account, review, CMS
Profile/progress, review queue, admin CRUD, CSV preview/import, audit logs, seed content. Exit: authorization/RLS verified; admin workflow works.

## Sprint 6 — QA & beta
E2E flows, accessibility, performance, mobile QA, content editorial review, monitoring, production deploy and rollback drill. Exit: acceptance checklist signed off, no P0/P1 open bugs.

## Dependency rules
No game implementation before common schemas/evaluator. No progress dashboard before authoritative session persistence. No production deploy before RLS, admin authorization and content QA. One task/PR at a time, with review gate.
