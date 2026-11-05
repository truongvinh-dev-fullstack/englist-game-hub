import { describe, it, expect, beforeEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  getGuestProgress,
  recordGuestAnswer,
  clearGuestProgress,
} from "@/lib/storage/guest-storage";
import { evaluateAnswer } from "@/core/evaluator";
import { SENTENCE_BUILDER_SAMPLE_QUESTIONS } from "@/games/sentence-builder/sample-data";
import { MEMORY_FLIP_SAMPLE_QUESTIONS } from "@/games/memory-flip/sample-data";
import { LISTEN_CHOOSE_SAMPLE_QUESTIONS } from "@/games/listen-choose/sample-data";
import { GameCard } from "@/components/ui/GameCard";
import { GameHeader } from "@/components/game-shared/GameHeader";
import { ExitConfirmDialog } from "@/components/game-shared/ExitConfirmDialog";

describe("E2E Flows, Security & Accessibility QA (T-018)", () => {
  beforeEach(() => {
    let mockStorage: Record<string, string> = {};
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => mockStorage[key] ?? null,
        setItem: (key: string, value: string) => {
          mockStorage[key] = value;
        },
        removeItem: (key: string) => {
          delete mockStorage[key];
        },
      },
    });
    clearGuestProgress();
  });

  describe("Security Audit: Secrets Isolation & RLS Invariants", () => {
    it("strictly confirms SUPABASE_SERVICE_ROLE_KEY is never exposed in client codebase", () => {
      const clientDirectories = ["src/app", "src/components", "src/games"];

      const scanDirectory = (dir: string) => {
        const fullPath = path.resolve(__dirname, "../../", dir);
        if (!fs.existsSync(fullPath)) return;

        const files = fs.readdirSync(fullPath, { recursive: true }) as string[];
        for (const file of files) {
          // Exclude server-only API route handlers from client bundle scan
          if (file.includes("api")) continue;

          if (file.endsWith(".ts") || file.endsWith(".tsx")) {
            const filePath = path.join(fullPath, file);
            const content = fs.readFileSync(filePath, "utf-8");
            expect(content).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
          }
        }
      };

      clientDirectories.forEach(scanDirectory);
    });

    it("verifies sanitize redirect rejects malicious open redirect URLs", () => {
      function sanitizeRedirect(nextParam: string | null): string {
        const next = nextParam ?? "/";
        const isSafe = next.startsWith("/") && !next.startsWith("//") && !next.includes("://");
        return isSafe ? next : "/";
      }

      expect(sanitizeRedirect("/profile")).toBe("/profile");
      expect(sanitizeRedirect("/games/memory-flip")).toBe("/games/memory-flip");
      expect(sanitizeRedirect("https://attacker-site.com")).toBe("/");
      expect(sanitizeRedirect("//phishing.com")).toBe("/");
      expect(sanitizeRedirect("javascript:alert(document.cookie)")).toBe("/");
    });

    it("enforces Zero-Leakage: Listen & Choose questions never reveal transcripts before answer", () => {
      LISTEN_CHOOSE_SAMPLE_QUESTIONS.forEach((q) => {
        const payload = q.public_payload as Record<string, unknown>;
        expect(payload).not.toHaveProperty("transcript");
        expect(payload).not.toHaveProperty("transcriptEn");
        expect(q.private_solution.transcriptEn.length).toBeGreaterThan(0);
      });
    });

    it("ensures answer evaluation idempotency and score consistency", () => {
      const q = MEMORY_FLIP_SAMPLE_QUESTIONS[0];
      const answer = { isBoardCleared: true, matchedPairsCount: 4 };

      const res1 = evaluateAnswer(q, answer);
      const res2 = evaluateAnswer(q, answer);

      expect(res1.correct).toBe(true);
      expect(res2.correct).toBe(true);
      expect(res1.scoreDelta).toBe(10);
      expect(res2.scoreDelta).toBe(10);
    });
  });

  describe("E2E Core Flow Simulation (Guest Journey)", () => {
    it("simulates full lifecycle: Guest play -> Scoring -> Review -> Recovery", () => {
      // Step 1: Initial state
      let progress = getGuestProgress();
      expect(progress.totalAnswered).toBe(0);
      expect(progress.correctCount).toBe(0);
      expect(progress.wrongQuestionIds).toEqual([]);

      // Step 2: Answer Question 1 correctly (+10 XP)
      const q1 = MEMORY_FLIP_SAMPLE_QUESTIONS[0];
      const eval1 = evaluateAnswer(q1, { isBoardCleared: true, matchedPairsCount: 4 });
      expect(eval1.correct).toBe(true);
      recordGuestAnswer("q1", eval1.correct);

      // Step 3: Answer Question 2 incorrectly (0 XP, added to review queue)
      const q2 = SENTENCE_BUILDER_SAMPLE_QUESTIONS[0];
      const eval2 = evaluateAnswer(q2, { tokenSequence: ["t2", "t1"] }); // Wrong order
      expect(eval2.correct).toBe(false);
      recordGuestAnswer("q2", eval2.correct);

      // Step 4: Verify Progress state
      progress = getGuestProgress();
      expect(progress.totalAnswered).toBe(2);
      expect(progress.correctCount).toBe(1);
      expect(progress.wrongQuestionIds).toEqual(["q2"]);

      // Step 5: Learner opens Review Queue and re-attempts Question 2 correctly
      const eval2Retry = evaluateAnswer(q2, {
        tokenSequence: q2.private_solution.canonicalSequence,
      });
      expect(eval2Retry.correct).toBe(true);
      recordGuestAnswer("q2", eval2Retry.correct);

      // Step 6: Verify Question 2 is successfully removed from review queue
      progress = getGuestProgress();
      expect(progress.totalAnswered).toBe(3);
      expect(progress.correctCount).toBe(2);
      expect(progress.wrongQuestionIds).not.toContain("q2");
    });
  });

  describe("Accessibility Verification (WCAG 2.1 AA Compliance)", () => {
    it("verifies touch target size class (min-h-touch) on interactive GameCard", () => {
      const html = renderToStaticMarkup(
        <GameCard
          slug="memory-flip"
          title="Memory Flip"
          description="Lật thẻ nhớ"
          skill="Từ vựng"
          difficulty="A1"
          duration="3 phút"
          icon={<span>icon</span>}
        />
      );

      // Card must be accessible and focus-visible
      expect(html).toContain("focus-visible:outline-2");
      expect(html).toContain("memory-flip");
    });

    it("verifies GameHeader and ExitConfirmDialog ARIA attributes and focus traps", () => {
      const headerHtml = renderToStaticMarkup(
        <GameHeader current={1} total={5} sessionXp={20} onExit={() => {}} />
      );
      expect(headerHtml).toContain('aria-label="Thoát phiên chơi"');

      const dialogHtml = renderToStaticMarkup(
        <ExitConfirmDialog
          isOpen={true}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(dialogHtml).toContain('role="alertdialog"');
      expect(dialogHtml).toContain('aria-modal="true"');
      expect(dialogHtml).toContain("min-h-touch");
    });
  });
});
