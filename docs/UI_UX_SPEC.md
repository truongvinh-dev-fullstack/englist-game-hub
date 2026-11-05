# UI/UX Specification

## Design tokens
Primary #2563EB; Teal #0D9488; Reward #F59E0B; Error #EF4444; Background #F8FAFC; Text #0F172A. Fonts Inter/Be Vietnam Pro. Spacing 4/8px; radius 12/16/20px; button min height 44px.

## Pages
### Home
Header, hero 'Chơi nhanh 5 phút', continue session, suggested games, daily goal, compact progress. Guest sees play-first CTA.
### Game Library
Search, filter chips (all/vocab/grammar/listening/speaking), topic/level selectors, card grid (icon, name, skill, duration, level), empty/loading/error states.
### Game detail
Short rules (<=3 steps), topic, level, estimated time, classic mode default, Start CTA. Returning user can skip tutorial.
### Play
Header with close/exit confirmation; progress current/total; prompt; game-specific interaction; Check/Next; feedback explanation; audio controls where needed. Disable double-submit; persist session state. On mobile bottom action safe-area aware.
### Result
Accuracy, correct/total, XP, time, mistake review, retry/next game. Clear distinction between earned XP and mastery.
### Topics
Office English, Daily Conversation, Travel & Business Trip, Career & Interview; each topic shows sample phrases, vocabulary and games.
### Review
Queue of errors, short practice session, explanations, 'mastered' status only after successful review, no punitive messaging.
### Progress
XP trend, practiced words, accuracy by skill and topic, recent sessions, explicit 'not enough data' state.
### Profile/Auth
Name/avatar, learning goal, language, audio preference, sign-in/out, account deletion path and privacy info.
### Admin
Content list/table, editor, status draft/review/published, preview, CSV validation and audit trail.

## Responsive
Mobile <640px: 2-column cards, bottom nav. Tablet 640–1023px: 2–3 columns. Desktop >=1024px: 3–4 columns. Game interactions use pointer + keyboard; avoid hover-only mechanics.

## Component inventory
AppShell, Header, BottomNav, GameCard, FilterChips, TopicCard, ProgressBar, XPBadge, QuestionPrompt, AnswerChoice, WordTile, AudioPlayer, FeedbackPanel, ResultSummary, EmptyState, ErrorState, Skeleton, ConfirmDialog, AdminDataTable.

## Accessibility
Visible focus, labels, no color-only feedback, reduced motion, meaningful screen reader messages, keyboard alternative to drag/drop, captions/transcripts where educationally appropriate. Audio question transcript must not reveal answer before submission.
