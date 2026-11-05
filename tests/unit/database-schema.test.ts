import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createAdminClient } from "@/lib/supabase/service-role";

describe("Database Schema & Supabase Configuration (T-003)", () => {
  const migrationPath = path.resolve(__dirname, "../../supabase/migrations/00001_initial_schema.sql");
  const seedPath = path.resolve(__dirname, "../../supabase/seed.sql");

  const migrationSql = fs.readFileSync(migrationPath, "utf-8");
  const seedSql = fs.readFileSync(seedPath, "utf-8");

  describe("SQL Migration Completeness", () => {
    const requiredTables = [
      "profiles",
      "user_roles",
      "topics",
      "games",
      "vocabulary",
      "grammar_rules",
      "questions",
      "question_options",
      "roleplay_scenarios",
      "roleplay_nodes",
      "game_sessions",
      "session_answers",
      "user_progress",
      "review_items",
      "achievements",
      "user_achievements",
      "admin_audit_logs",
    ];

    it.each(requiredTables)("defines table %s with proper schema", (tableName) => {
      const regex = new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${tableName}\\b`, "i");
      expect(migrationSql).toMatch(regex);
    });

    it.each(requiredTables)("enables Row Level Security (RLS) on %s", (tableName) => {
      const regex = new RegExp(`ALTER TABLE public\\.${tableName} ENABLE ROW LEVEL SECURITY;`, "i");
      expect(migrationSql).toMatch(regex);
    });
  });

  describe("Data Integrity & Unique Constraints", () => {
    it("enforces idempotent answers via (session_id, request_id) unique constraint", () => {
      expect(migrationSql).toMatch(
        /CONSTRAINT uq_session_request_id UNIQUE \(\s*session_id\s*,\s*request_id\s*\)/i
      );
    });

    it("enforces single answer per question per session via (session_id, question_id)", () => {
      expect(migrationSql).toMatch(
        /CONSTRAINT uq_session_question_id UNIQUE \(\s*session_id\s*,\s*question_id\s*\)/i
      );
    });

    it("enforces composite key on user_progress (user_id, skill, topic_id)", () => {
      expect(migrationSql).toMatch(
        /PRIMARY KEY \(\s*user_id\s*,\s*skill\s*,\s*topic_id\s*\)/i
      );
    });

    it("enforces unique review item per question (user_id, question_id)", () => {
      expect(migrationSql).toMatch(
        /CONSTRAINT uq_user_review_question UNIQUE \(\s*user_id\s*,\s*question_id\s*\)/i
      );
    });

    it("enforces composite key on user_achievements (user_id, achievement_id)", () => {
      expect(migrationSql).toMatch(
        /PRIMARY KEY \(\s*user_id\s*,\s*achievement_id\s*\)/i
      );
    });
  });

  describe("Performance Indexes", () => {
    it("creates index for question lookup by (status, game_type, topic_id, difficulty)", () => {
      expect(migrationSql).toMatch(/CREATE INDEX IF NOT EXISTS idx_questions_lookup/i);
      expect(migrationSql).toMatch(/\(status,\s*game_type,\s*topic_id,\s*difficulty\)/i);
    });

    it("creates index for user game sessions by (user_id, started_at DESC)", () => {
      expect(migrationSql).toMatch(/CREATE INDEX IF NOT EXISTS idx_game_sessions_user_started/i);
      expect(migrationSql).toMatch(/\(user_id,\s*started_at DESC\)/i);
    });

    it("creates index for user review schedule by (user_id, next_review_at)", () => {
      expect(migrationSql).toMatch(/CREATE INDEX IF NOT EXISTS idx_review_items_user_schedule/i);
      expect(migrationSql).toMatch(/\(user_id,\s*next_review_at\)/i);
    });
  });

  describe("Security & Sensitive Solution Isolation", () => {
    it("creates safe view public_questions that isolates private_solution", () => {
      expect(migrationSql).toMatch(/CREATE OR REPLACE VIEW public\.public_questions/i);
      // Ensure private_solution is NOT in the public_questions SELECT list
      const viewSelectMatch = migrationSql.match(
        /CREATE OR REPLACE VIEW public\.public_questions AS[\s\S]*?FROM public\.questions/i
      );
      expect(viewSelectMatch).toBeTruthy();
      expect(viewSelectMatch?.[0]).not.toContain("private_solution");
      expect(viewSelectMatch?.[0]).not.toContain("explanation_vi");
    });

    it("restricts direct SELECT access to questions table to admin only", () => {
      expect(migrationSql).toMatch(/CREATE POLICY "Questions viewable by admins only"/i);
    });

    it("restricts roleplay_nodes direct SELECT to admin only", () => {
      expect(migrationSql).toMatch(/CREATE POLICY "Roleplay nodes viewable by admins only"/i);
    });

    it("contains is_admin() server-side security function", () => {
      expect(migrationSql).toMatch(/CREATE OR REPLACE FUNCTION public\.is_admin/i);
      expect(migrationSql).toMatch(/SECURITY DEFINER/i);
    });
  });

  describe("Seed Data Completeness", () => {
    it("seeds all 5 MVP games", () => {
      expect(seedSql).toContain("'memory-flip'");
      expect(seedSql).toContain("'sentence-builder'");
      expect(seedSql).toContain("'error-detective'");
      expect(seedSql).toContain("'listen-choose'");
      expect(seedSql).toContain("'roleplay'");
    });

    it("seeds essential workplace topics", () => {
      expect(seedSql).toContain("'office-meetings'");
      expect(seedSql).toContain("'email-scheduling'");
      expect(seedSql).toContain("'phone-calls'");
      expect(seedSql).toContain("'daily-socializing'");
    });
  });

  describe("Supabase Client Security Invariants", () => {
    it("createAdminClient throws an error if called in a browser environment", () => {
      vi.stubGlobal("window", {});
      expect(() => createAdminClient()).toThrow(/SECURITY VIOLATION/);
      vi.unstubAllGlobals();
    });

    it("createAdminClient throws an error when SUPABASE_SERVICE_ROLE_KEY is missing", () => {
      const originalEnv = process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => createAdminClient()).toThrow(/Missing Supabase admin environment variables/);

      if (originalEnv) {
        process.env.SUPABASE_SERVICE_ROLE_KEY = originalEnv;
      }
    });
  });
});

