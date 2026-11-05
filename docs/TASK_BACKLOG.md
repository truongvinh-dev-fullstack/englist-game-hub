# Task Backlog — Gemini Execution Queue

Status values: TODO, IN_PROGRESS, BLOCKED, REVIEW, DONE. Complete one task at a time. Do not mark DONE without tests.

| ID | Task | Status | Dependencies | Deliverable | Verification |
|---|---|---|---|---|---|
| T-001 | Init Next.js TS strict/Tailwind | DONE | None | App skeleton | build, lint |
| T-002 | Design tokens/AppShell/responsive nav | DONE | T-001 | UI shell | viewport 360/768/1440 |
| T-003 | Supabase config + migrations + RLS | DONE | T-001 | SQL migrations | RLS tests |
| T-004 | Auth + guest boundaries | DONE | T-003 | Auth flow | auth tests |
| T-005 | Content schemas + seed validator | DONE | T-003 | Zod schemas | unit tests |
| T-006 | Session API + idempotent scoring | DONE | T-004,T-005 | API routes | integration tests |
| T-007 | Shared Game UI and result screen | DONE | T-002,T-006 | components | UI tests |
| T-008 | Picture Match | DONE | T-007 | game | gameplay tests |
| T-009 | Memory Flip | DONE | T-007 | game | gameplay tests |
| T-010 | Sentence Builder | DONE | T-007 | game | accepted order tests |
| T-011 | Error Detective | DONE | T-007 | game | ambiguity tests |
| T-012 | Listen & Choose | DONE | T-007 | game/audio | audio error tests |
| T-013 | Roleplay Simulator | DONE | T-007 | branch engine | branch coverage |
| T-014 | Game Library + Topics | DONE | T-002,T-005 | pages | filter tests |
| T-015 | Progress + Review | DONE | T-006 | pages/queries | ownership tests |
| T-016 | Admin CRUD + import CSV | DONE | T-003,T-005 | admin pages | RBAC/import tests |
| T-017 | Seed editorial content | DONE | T-016 | reviewed content | editorial QA |
| T-018 | E2E/security/accessibility | DONE | T-008..T-017 | QA report | release checklist |
| T-019 | Deploy/monitoring/rollback | DONE | T-018 | production | smoke test |

## Task protocol
Before: read requirements and list files to change. During: change only task scope. After: report modified files, commands/results, edge cases, remaining risks, next task. Stop on unresolved architecture decision.
