# API Specification — MVP

## Auth
Supabase Auth, secure cookies via supported SSR pattern. Endpoints authenticate on server and validate all input with Zod. Rate limit mutation endpoints.

## Public
`GET /api/games` list enabled games; `GET /api/topics`; `GET /api/games/:slug/config` safe game metadata.

## Learner
`POST /api/sessions` `{gameSlug, topicId?, difficulty?}` -> `{sessionId, question, progress}`.
`GET /api/sessions/:id` -> current state; owner only.
`POST /api/sessions/:id/answer` `{questionId, answer, requestId}` -> `{correct, explanation, correctAnswer, scoreDelta, nextAvailable}`. Validate ownership, ordering, question type, idempotency.
`POST /api/sessions/:id/finish` -> final result; idempotent transaction.
`GET /api/users/me/progress` -> aggregate by skill/topic.
`GET /api/users/me/review` -> review queue.

## Admin
`POST /api/admin/questions`, `PATCH /api/admin/questions/:id`, `POST /api/admin/import` (CSV parse, preview/validation, commit separately), content moderation workflow. Admin access checked in server actions/routes.

## Error contract
`{error:{code,message,details?},requestId}`; standard statuses 400 validation, 401 unauthenticated, 403 forbidden, 404 missing, 409 conflict, 429 rate-limited, 500 server error. Never leak private solutions in errors or logs.

## API testing
Unauthorized/other-user access denied; duplicate requestId returns same result; finish twice does not duplicate XP; malformed answer rejected; no private solution exposed before answer; content pagination and filtering bounded.
