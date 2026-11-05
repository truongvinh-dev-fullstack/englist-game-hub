-- ==============================================================================
-- ENGLISH GAME HUB — INITIAL DATABASE SCHEMA MIGRATION (00001)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('draft', 'review', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE game_type AS ENUM (
    'picture-match',
    'memory-flip',
    'sentence-builder',
    'error-detective',
    'listen-choose',
    'roleplay'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('A0', 'A1', 'A2', 'B1');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE skill_type AS ENUM ('vocabulary', 'grammar', 'listening', 'speaking');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE session_status AS ENUM ('created', 'active', 'completed', 'abandoned');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE review_state AS ENUM ('new', 'learning', 'reviewing', 'mastered');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('admin', 'editor', 'moderator');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. CORE USER & ROLE TABLES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

-- 4. CONTENT & CATALOG TABLES
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_vi TEXT NOT NULL,
  description TEXT,
  status content_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  type game_type NOT NULL UNIQUE,
  title TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lemma TEXT NOT NULL,
  phonetic TEXT,
  meaning_vi TEXT NOT NULL,
  example_en TEXT,
  audio_path TEXT,
  image_path TEXT,
  level difficulty_level NOT NULL DEFAULT 'A1',
  status content_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.grammar_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  explanation_vi TEXT NOT NULL,
  examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  level difficulty_level NOT NULL DEFAULT 'A1',
  status content_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type game_type NOT NULL,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE RESTRICT,
  difficulty difficulty_level NOT NULL DEFAULT 'A1',
  skill skill_type NOT NULL DEFAULT 'vocabulary',
  prompt TEXT NOT NULL,
  public_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  private_solution JSONB NOT NULL DEFAULT '{}'::jsonb,
  explanation_vi TEXT NOT NULL,
  concept_tags TEXT[] NOT NULL DEFAULT '{}',
  status content_status NOT NULL DEFAULT 'draft',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roleplay_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  start_node_id UUID,
  status content_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roleplay_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.roleplay_scenarios(id) ON DELETE CASCADE,
  npc_text TEXT NOT NULL,
  choices JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_terminal BOOLEAN NOT NULL DEFAULT false,
  rubric JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Foreign key for start_node_id after table exists
DO $$ BEGIN
  ALTER TABLE public.roleplay_scenarios
    ADD CONSTRAINT fk_roleplay_start_node
    FOREIGN KEY (start_node_id)
    REFERENCES public.roleplay_nodes(id)
    ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5. GAME SESSIONS & ANSWERS
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE RESTRICT,
  status session_status NOT NULL DEFAULT 'created',
  question_ids UUID[] NOT NULL DEFAULT '{}',
  current_index INTEGER NOT NULL DEFAULT 0,
  seed INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.session_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
  request_id TEXT NOT NULL,
  answer JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL,
  score_delta INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_session_request_id UNIQUE (session_id, request_id),
  CONSTRAINT uq_session_question_id UNIQUE (session_id, question_id)
);

-- 6. PROGRESS, REVIEW & ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill skill_type NOT NULL,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  correct_count INTEGER NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill, topic_id)
);

CREATE TABLE IF NOT EXISTS public.review_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  wrong_count INTEGER NOT NULL DEFAULT 1 CHECK (wrong_count >= 0),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  state review_state NOT NULL DEFAULT 'new',
  CONSTRAINT uq_user_review_question UNIQUE (user_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  condition JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

-- 7. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  before JSONB,
  after JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. INDEXES (Spec-mandated)
CREATE INDEX IF NOT EXISTS idx_questions_lookup
  ON public.questions (status, game_type, topic_id, difficulty);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_started
  ON public.game_sessions (user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_review_items_user_schedule
  ON public.review_items (user_id, next_review_at);

CREATE INDEX IF NOT EXISTS idx_vocabulary_status_level
  ON public.vocabulary (status, level);

CREATE INDEX IF NOT EXISTS idx_session_answers_session
  ON public.session_answers (session_id);

-- 9. HELPER FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_topics_updated_at ON public.topics;
CREATE TRIGGER trg_topics_updated_at BEFORE UPDATE ON public.topics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_games_updated_at ON public.games;
CREATE TRIGGER trg_games_updated_at BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_questions_updated_at ON public.questions;
CREATE TRIGGER trg_questions_updated_at BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Security function to verify administrative privileges server-side
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  IF check_user_id IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create a profile entry when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Học viên'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roleplay_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roleplay_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 10.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 10.2 USER ROLES POLICIES
DROP POLICY IF EXISTS "Admins can view and manage user roles" ON public.user_roles;
CREATE POLICY "Admins can view and manage user roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin());

-- 10.3 PUBLIC READ-ONLY CONTENT (TOPICS, GAMES, VOCABULARY, GRAMMAR)
DROP POLICY IF EXISTS "Published topics are viewable by everyone" ON public.topics;
CREATE POLICY "Published topics are viewable by everyone"
  ON public.topics FOR SELECT
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage topics" ON public.topics;
CREATE POLICY "Admins can manage topics"
  ON public.topics FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Enabled games are viewable by everyone" ON public.games;
CREATE POLICY "Enabled games are viewable by everyone"
  ON public.games FOR SELECT
  USING (is_enabled = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage games" ON public.games;
CREATE POLICY "Admins can manage games"
  ON public.games FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Published vocabulary is viewable by everyone" ON public.vocabulary;
CREATE POLICY "Published vocabulary is viewable by everyone"
  ON public.vocabulary FOR SELECT
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage vocabulary" ON public.vocabulary;
CREATE POLICY "Admins can manage vocabulary"
  ON public.vocabulary FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Published grammar rules are viewable by everyone" ON public.grammar_rules;
CREATE POLICY "Published grammar rules are viewable by everyone"
  ON public.grammar_rules FOR SELECT
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage grammar rules" ON public.grammar_rules;
CREATE POLICY "Admins can manage grammar rules"
  ON public.grammar_rules FOR ALL
  USING (public.is_admin());

-- 10.4 QUESTIONS & OPTIONS SECURITY
-- CRITICAL: Prevent direct leakage of private_solution to anon or authenticated users.
-- We expose a safe view `public_questions` for learners/public.
DROP VIEW IF EXISTS public.public_questions;
CREATE OR REPLACE VIEW public.public_questions AS
  SELECT
    id,
    game_type,
    topic_id,
    difficulty,
    skill,
    prompt,
    public_payload,
    concept_tags,
    version
  FROM public.questions
  WHERE status = 'published';

-- Direct SELECT on questions table is restricted to admins or via server service role
DROP POLICY IF EXISTS "Questions viewable by admins only" ON public.questions;
CREATE POLICY "Questions viewable by admins only"
  ON public.questions FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Published question options viewable by everyone" ON public.question_options;
CREATE POLICY "Published question options viewable by everyone"
  ON public.question_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = question_id AND (q.status = 'published' OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins can manage question options" ON public.question_options;
CREATE POLICY "Admins can manage question options"
  ON public.question_options FOR ALL
  USING (public.is_admin());

-- 10.5 ROLEPLAY SCENARIOS & NODES SECURITY
DROP POLICY IF EXISTS "Published roleplay scenarios viewable by everyone" ON public.roleplay_scenarios;
CREATE POLICY "Published roleplay scenarios viewable by everyone"
  ON public.roleplay_scenarios FOR SELECT
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage roleplay scenarios" ON public.roleplay_scenarios;
CREATE POLICY "Admins can manage roleplay scenarios"
  ON public.roleplay_scenarios FOR ALL
  USING (public.is_admin());

-- Direct SELECT on roleplay_nodes is admin only; public gets nodes via server session
DROP POLICY IF EXISTS "Roleplay nodes viewable by admins only" ON public.roleplay_nodes;
CREATE POLICY "Roleplay nodes viewable by admins only"
  ON public.roleplay_nodes FOR ALL
  USING (public.is_admin());

-- 10.6 GAME SESSIONS & SESSION ANSWERS (Owner-Only)
DROP POLICY IF EXISTS "Users can view own game sessions" ON public.game_sessions;
CREATE POLICY "Users can view own game sessions"
  ON public.game_sessions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own game sessions" ON public.game_sessions;
CREATE POLICY "Users can insert own game sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own game sessions" ON public.game_sessions;
CREATE POLICY "Users can update own game sessions"
  ON public.game_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own session answers" ON public.session_answers;
CREATE POLICY "Users can view own session answers"
  ON public.session_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions s
      WHERE s.id = session_id AND (s.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Users can insert own session answers" ON public.session_answers;
CREATE POLICY "Users can insert own session answers"
  ON public.session_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.game_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- 10.7 USER PROGRESS & REVIEW ITEMS (Owner-Only)
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_progress;
CREATE POLICY "Users can manage own progress"
  ON public.user_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own review items" ON public.review_items;
CREATE POLICY "Users can view own review items"
  ON public.review_items FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own review items" ON public.review_items;
CREATE POLICY "Users can manage own review items"
  ON public.review_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 10.8 ACHIEVEMENTS & USER ACHIEVEMENTS
DROP POLICY IF EXISTS "Achievements viewable by everyone" ON public.achievements;
CREATE POLICY "Achievements viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage achievements" ON public.achievements;
CREATE POLICY "Admins can manage achievements"
  ON public.achievements FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can receive achievements" ON public.user_achievements;
CREATE POLICY "Users can receive achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 10.9 AUDIT LOGS (Admin-Only)
DROP POLICY IF EXISTS "Audit logs viewable by admins only" ON public.admin_audit_logs;
CREATE POLICY "Audit logs viewable by admins only"
  ON public.admin_audit_logs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Audit logs insertable by admins only" ON public.admin_audit_logs;
CREATE POLICY "Audit logs insertable by admins only"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (public.is_admin() AND auth.uid() = actor_id);

