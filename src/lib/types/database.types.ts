export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ContentStatus = "draft" | "review" | "published" | "archived";
export type GameType =
  | "memory-flip"
  | "sentence-builder"
  | "error-detective"
  | "listen-choose"
  | "roleplay";
export type DifficultyLevel = "A0" | "A1" | "A2" | "B1";
export type SkillType = "vocabulary" | "grammar" | "listening" | "speaking";
export type SessionStatus = "created" | "active" | "completed" | "abandoned";
export type ReviewState = "new" | "learning" | "reviewing" | "mastered";
export type AdminRole = "admin" | "editor" | "moderator";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: AdminRole;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: AdminRole;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: AdminRole;
          created_at?: string;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          id: string;
          slug: string;
          title_vi: string;
          description: string | null;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_vi: string;
          description?: string | null;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title_vi?: string;
          description?: string | null;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      games: {
        Row: {
          id: string;
          slug: string;
          type: GameType;
          title: string;
          is_enabled: boolean;
          config: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          type: GameType;
          title: string;
          is_enabled?: boolean;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          type?: GameType;
          title?: string;
          is_enabled?: boolean;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vocabulary: {
        Row: {
          id: string;
          lemma: string;
          phonetic: string | null;
          meaning_vi: string;
          example_en: string | null;
          audio_path: string | null;
          image_path: string | null;
          level: DifficultyLevel;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lemma: string;
          phonetic?: string | null;
          meaning_vi: string;
          example_en?: string | null;
          audio_path?: string | null;
          image_path?: string | null;
          level?: DifficultyLevel;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lemma?: string;
          phonetic?: string | null;
          meaning_vi?: string;
          example_en?: string | null;
          audio_path?: string | null;
          image_path?: string | null;
          level?: DifficultyLevel;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      grammar_rules: {
        Row: {
          id: string;
          title: string;
          explanation_vi: string;
          examples: Json;
          level: DifficultyLevel;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          explanation_vi: string;
          examples?: Json;
          level?: DifficultyLevel;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          explanation_vi?: string;
          examples?: Json;
          level?: DifficultyLevel;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          game_type: GameType;
          topic_id: string;
          difficulty: DifficultyLevel;
          skill: SkillType;
          prompt: string;
          public_payload: Json;
          private_solution: Json;
          explanation_vi: string;
          concept_tags: string[];
          status: ContentStatus;
          reviewed_by: string | null;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          game_type: GameType;
          topic_id: string;
          difficulty?: DifficultyLevel;
          skill?: SkillType;
          prompt: string;
          public_payload: Json;
          private_solution: Json;
          explanation_vi: string;
          concept_tags?: string[];
          status?: ContentStatus;
          reviewed_by?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          game_type?: GameType;
          topic_id?: string;
          difficulty?: DifficultyLevel;
          skill?: SkillType;
          prompt?: string;
          public_payload?: Json;
          private_solution?: Json;
          explanation_vi?: string;
          concept_tags?: string[];
          status?: ContentStatus;
          reviewed_by?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      question_options: {
        Row: {
          id: string;
          question_id: string;
          option_payload: Json;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_payload: Json;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          option_payload?: Json;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      roleplay_scenarios: {
        Row: {
          id: string;
          topic_id: string;
          title: string;
          start_node_id: string | null;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          title: string;
          start_node_id?: string | null;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          title?: string;
          start_node_id?: string | null;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      roleplay_nodes: {
        Row: {
          id: string;
          scenario_id: string;
          npc_text: string;
          choices: Json;
          is_terminal: boolean;
          rubric: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          scenario_id: string;
          npc_text: string;
          choices?: Json;
          is_terminal?: boolean;
          rubric?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          scenario_id?: string;
          npc_text?: string;
          choices?: Json;
          is_terminal?: boolean;
          rubric?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          status: SessionStatus;
          question_ids: string[];
          current_index: number;
          seed: number;
          started_at: string;
          completed_at: string | null;
          total_xp: number;
          version: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          status?: SessionStatus;
          question_ids: string[];
          current_index?: number;
          seed?: number;
          started_at?: string;
          completed_at?: string | null;
          total_xp?: number;
          version?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          status?: SessionStatus;
          question_ids?: string[];
          current_index?: number;
          seed?: number;
          started_at?: string;
          completed_at?: string | null;
          total_xp?: number;
          version?: number;
        };
        Relationships: [];
      };
      session_answers: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          request_id: string;
          answer: Json;
          is_correct: boolean;
          score_delta: number;
          answered_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question_id: string;
          request_id: string;
          answer: Json;
          is_correct: boolean;
          score_delta?: number;
          answered_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          question_id?: string;
          request_id?: string;
          answer?: Json;
          is_correct?: boolean;
          score_delta?: number;
          answered_at?: string;
        };
        Relationships: [];
      };
      user_progress: {
        Row: {
          user_id: string;
          skill: SkillType;
          topic_id: string;
          attempts: number;
          correct_count: number;
          total_xp: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          skill: SkillType;
          topic_id: string;
          attempts?: number;
          correct_count?: number;
          total_xp?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          skill?: SkillType;
          topic_id?: string;
          attempts?: number;
          correct_count?: number;
          total_xp?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      review_items: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          wrong_count: number;
          last_seen_at: string;
          next_review_at: string;
          state: ReviewState;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          wrong_count?: number;
          last_seen_at?: string;
          next_review_at?: string;
          state?: ReviewState;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          wrong_count?: number;
          last_seen_at?: string;
          next_review_at?: string;
          state?: ReviewState;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          code: string;
          title: string;
          condition: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          condition?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          title?: string;
          condition?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          earned_at?: string;
        };
        Update: {
          user_id?: string;
          achievement_id?: string;
          earned_at?: string;
        };
        Relationships: [];
      };
      admin_audit_logs: {
        Row: {
          id: string;
          actor_id: string;
          action: string;
          resource: string;
          resource_id: string;
          before: Json | null;
          after: Json | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          actor_id: string;
          action: string;
          resource: string;
          resource_id: string;
          before?: Json | null;
          after?: Json | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          actor_id?: string;
          action?: string;
          resource?: string;
          resource_id?: string;
          before?: Json | null;
          after?: Json | null;
          timestamp?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      public_questions: {
        Row: {
          id: string;
          game_type: GameType;
          topic_id: string;
          difficulty: DifficultyLevel;
          skill: SkillType;
          prompt: string;
          public_payload: Json;
          concept_tags: string[];
          version: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: { check_user_id?: string };
        Returns: boolean;
      };
    };
  };
}
