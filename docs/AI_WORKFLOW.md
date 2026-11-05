# AI Workflow — Gemini 3.8 Flash

## Session start
1. Read `GEMINI.md`, `docs/README.md`, relevant specs and task backlog.
2. Inspect existing repository and current tests; never assume files exist.
3. Select exactly one task ID and propose a short plan with touched files and tests.
4. If requirements conflict or critical details missing, stop and ask; do not invent product decisions.

## Coding rules
- Small changes, reuse existing patterns, TypeScript strict, Zod input validation.
- No architecture/library upgrades without approval.
- No API keys or service-role credentials in frontend, logs or commits.
- No client-trusted scoring, admin role, private solution or user ID.
- Use DB migrations, do not change production schema manually.
- No fake tests, placeholder 'completed' features or silent skipped checks.
- Do not add unrelated features; no AI conversation/Phaser in MVP.

## Completion format
Task ID; summary; files changed; migrations; tests run with pass/fail; manual verification; known issues; next task suggestion. If tests unavailable, explicitly state 'not run' and reason.

## Review gate
Task DONE only when acceptance criteria met and user/reviewer approves. If blocked, mark BLOCKED and record decision needed.
