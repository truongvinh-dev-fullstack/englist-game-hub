# Game Engine Technical Contract

## Principles
Game Core separates content, rendering, evaluation, session state and XP. Each game implements a common adapter; do not duplicate scoring/session code. React is sufficient for MVP.

## Types (conceptual)
```ts
type GameType = 'picture-match'|'memory-flip'|'sentence-builder'|'error-detective'|'listen-choose'|'roleplay';
type GameSessionStatus = 'created'|'active'|'completed'|'abandoned';
interface PublicQuestion { id: string; type: GameType; prompt: string; payload: Record<string, unknown>; }
interface AnswerSubmission { sessionId: string; questionId: string; answer: unknown; requestId: string; }
interface AnswerFeedback { correct: boolean; explanation: string; scoreDelta: number; correctAnswer?: unknown; }
interface GameAdapter { type: GameType; validateQuestion(q: unknown): boolean; renderKey: string; }
```

## Session lifecycle
CREATED -> ACTIVE -> COMPLETED or ABANDONED. Store ordered question IDs and deterministic random seed server-side. Answer only current question; requestId deduplicates retry. Server validates payload and scores. After answer, return correct answer and explanation; never include solutions in pre-answer payload. Finish is idempotent. Persist XP transactionally and only once per session.

## Scoring MVP
Each correct question = 10 base XP; wrong = 0; completion bonus = 0 initially. Roleplay branch score based on authored rubrics; no timer bonus in classic mode. Maximum XP per session capped server-side. UI may animate points but server is authoritative.

## Review
Record wrong concept tags. On review success mark improved; spaced repetition scheduling deferred to post-MVP. A question cannot be marked mastered after one correct guess without a defined policy.

## Guest sessions
Guest gameplay can be local-only for MVP, using same evaluation rules in an isolated local practice mode with no trusted XP. For registered users, server sessions and trusted XP. Never trust guest-provided scores when migrating to account. Clearly label guest progress as local.

## Error handling
Network failure -> retry with same requestId; duplicate answer -> same feedback; expired session -> explain and offer restart; invalid question -> log and exclude from pool; insufficient content -> prevent starting and show alternate topic.
