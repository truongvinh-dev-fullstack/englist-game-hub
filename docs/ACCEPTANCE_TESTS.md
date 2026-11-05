# Acceptance & Test Plan

## Core test cases
- Guest opens home -> library -> starts game -> gets result without login.
- Learner signs in -> plays -> refreshes -> progress remains correct.
- Six game types: valid answer, invalid answer, skip/exit, replay, empty content, keyboard navigation.
- Double-click submit and network retry -> one scored answer.
- Double finish -> XP added once.
- User A cannot read/modify User B sessions/progress.
- Anonymous browser cannot access admin; forged admin flag denied.
- Public question payload never includes correct answer or roleplay rubric.
- Audio unavailable -> actionable fallback, no blank screen.
- Imported CSV invalid rows -> clear preview errors, no partial unexpected publication.
- Screen widths 360, 390, 768, 1024, 1440; portrait/landscape where practical.
- Focus navigation, accessible labels, screen reader announcements, reduced motion.
- Content review: all 300 words, 12 grammar topics and 20 scenarios pass linguistic QA.

## Commands (adjust to project scripts)
`npm run lint`; `npm run typecheck`; `npm run test`; `npm run test:e2e`; `npm run build`.

## Release gate
No unresolved critical/high severity security or data integrity bugs; main flows pass; RLS verified; content licensed; backup/rollback documented; env secrets validated; smoke tests on production URL.
