import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { validateSeedBatch } from "@/lib/validations/content/seed-validator";
import { getAllEditorialQuestions } from "@/lib/data/editorial-seed-content";

describe("Editorial Content QA & Seed Integrity (T-017)", () => {
  const editorialQuestions = getAllEditorialQuestions();

  describe("Batch Schema Validation & Content Guidelines", () => {
    it("validates that 100% of curated seed questions strictly pass Zod schemas", () => {
      const report = validateSeedBatch(editorialQuestions);

      if (!report.isValid) {
        console.error("Editorial QA Errors:", JSON.stringify(report.errors, null, 2));
      }

      expect(report.isValid).toBe(true);
      expect(report.invalidCount).toBe(0);
      expect(report.validCount).toBe(editorialQuestions.length);
      expect(report.total).toBeGreaterThanOrEqual(20);
    });

    it("verifies coverage across all 5 core MVP mini-games", () => {
      const report = validateSeedBatch(editorialQuestions);
      const breakdown = report.gameTypeBreakdown;

      expect(breakdown["memory-flip"]).toBeGreaterThanOrEqual(4);
      expect(breakdown["sentence-builder"]).toBeGreaterThanOrEqual(4);
      expect(breakdown["error-detective"]).toBeGreaterThanOrEqual(4);
      expect(breakdown["listen-choose"]).toBeGreaterThanOrEqual(4);
      expect(breakdown["roleplay"]).toBeGreaterThanOrEqual(4);
    });

    it("verifies CEFR-like difficulty level diversity (A1, A2, B1)", () => {
      const report = validateSeedBatch(editorialQuestions);
      const diff = report.difficultyBreakdown;

      expect(diff["A1"]).toBeGreaterThanOrEqual(5);
      expect(diff["A2"]).toBeGreaterThanOrEqual(5);
      expect(diff["B1"]).toBeGreaterThanOrEqual(2);
    });

    it("verifies 4 core skill areas coverage (vocabulary, grammar, listening, speaking)", () => {
      const report = validateSeedBatch(editorialQuestions);
      const skills = report.skillBreakdown;

      expect(skills["vocabulary"]).toBeGreaterThanOrEqual(2);
      expect(skills["grammar"]).toBeGreaterThanOrEqual(8);
      expect(skills["listening"]).toBeGreaterThanOrEqual(4);
      expect(skills["speaking"]).toBeGreaterThanOrEqual(4);
    });
  });

  describe("Pedagogical Rules & Zero-Leakage Invariant", () => {
    it("ensures every question has high-quality Vietnamese explanation (1-3 sentences)", () => {
      editorialQuestions.forEach((q) => {
        expect(q.explanation_vi.length).toBeGreaterThanOrEqual(15);
        expect(q.explanation_vi.length).toBeLessThanOrEqual(500);
      });
    });

    it("ensures every question is tagged with actionable concept tags", () => {
      editorialQuestions.forEach((q) => {
        expect(q.concept_tags.length).toBeGreaterThanOrEqual(1);
        q.concept_tags.forEach((tag) => {
          expect(tag.trim().length).toBeGreaterThan(0);
        });
      });
    });

    it("ensures 100% published status with reviewer attribution", () => {
      editorialQuestions.forEach((q) => {
        expect(q.status).toBe("published");
        expect(q.reviewed_by).toBeDefined();
        expect(q.version).toBeGreaterThanOrEqual(1);
      });
    });

    it("verifies zero transcript leakage in Listen & Choose public payloads", () => {
      const listenQuestions = editorialQuestions.filter((q) => q.game_type === "listen-choose");
      listenQuestions.forEach((q) => {
        const payload = q.public_payload as Record<string, unknown>;
        expect(payload).not.toHaveProperty("transcript");
        expect(payload).not.toHaveProperty("transcriptEn");
        expect(payload).toHaveProperty("audioPath");
      });
    });
  });

  describe("Database seed.sql File Verification", () => {
    it("verifies seed.sql includes games, topics, achievements, and editorial questions", () => {
      const seedSqlPath = path.resolve(__dirname, "../../supabase/seed.sql");
      const seedSql = fs.readFileSync(seedSqlPath, "utf-8");

      expect(seedSql).toContain("INSERT INTO public.games");
      expect(seedSql).toContain("INSERT INTO public.topics");
      expect(seedSql).toContain("INSERT INTO public.achievements");
      expect(seedSql).toContain("INSERT INTO public.questions");
      expect(seedSql).toContain("memory-flip");
      expect(seedSql).toContain("sentence-builder");
      expect(seedSql).toContain("error-detective");
      expect(seedSql).toContain("listen-choose");
      expect(seedSql).toContain("roleplay");
    });
  });
});

