# Database Schema — Logical Design

## Tables
- `profiles`: id UUID PK references auth.users, display_name, avatar_url, created_at.
- `topics`: id UUID PK, slug UNIQUE, title_vi, description, status.
- `games`: id UUID PK, slug UNIQUE, type UNIQUE, title, is_enabled, config JSONB.
- `vocabulary`: id UUID PK, lemma, phonetic, meaning_vi, example_en, audio_path, image_path, level, status.
- `grammar_rules`: id UUID PK, title, explanation_vi, examples JSONB, level, status.
- `questions`: id UUID PK, game_type, topic_id FK, difficulty, skill, prompt, public_payload JSONB, private_solution JSONB, explanation_vi, concept_tags TEXT[], status, reviewed_by, version, created_at.
- `question_options`: id UUID PK, question_id FK, option_payload JSONB, display_order; no `is_correct` in public query.
- `roleplay_scenarios`: id UUID PK, topic_id FK, title, start_node_id, status.
- `roleplay_nodes`: id UUID PK, scenario_id FK, npc_text, choices JSONB, is_terminal, rubric JSONB (server only).
- `game_sessions`: id UUID PK, user_id FK, game_id FK, status, question_ids UUID[], current_index, seed, started_at, completed_at, total_xp, version.
- `session_answers`: id UUID PK, session_id FK, question_id FK, request_id UNIQUE per session, answer JSONB, is_correct, score_delta, answered_at.
- `user_progress`: user_id, skill, topic_id, attempts, correct_count, total_xp, updated_at; composite unique key.
- `review_items`: id UUID PK, user_id FK, question_id FK, wrong_count, last_seen_at, next_review_at, state.
- `achievements`: id UUID PK, code UNIQUE, title, condition JSONB.
- `user_achievements`: user_id FK, achievement_id FK, earned_at; composite PK.
- `admin_audit_logs`: id UUID PK, actor_id, action, resource, resource_id, before JSONB, after JSONB, timestamp.

## Policies and integrity
All personal rows protected with RLS (owner-only). Published public content is read-only for public/learner role; private_solution and rubrics must be isolated in server-only table/view or accessed only by privileged server function. Do not rely on column hiding in unrestricted client SELECT. Admin role checked server-side via trusted claims/role table; never trust client flag. Unique session answer constraint `(session_id, request_id)`; enforce one answer per question. Index questions by `(status,game_type,topic_id,difficulty)`, sessions by `(user_id,started_at DESC)`, review by `(user_id,next_review_at)`.

## Migrations
Use numbered SQL migrations, no schema changes manually in production. Seed content separately. Delete user data via explicit policy and cascade plan; do not expose service-role key to browser.
