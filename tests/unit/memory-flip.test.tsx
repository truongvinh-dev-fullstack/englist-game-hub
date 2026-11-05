import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { memoryFlipAdapter } from "@/games/memory-flip/adapter";
import { MEMORY_FLIP_SAMPLE_QUESTIONS } from "@/games/memory-flip/sample-data";
import { MemoryFlipRenderer } from "@/games/memory-flip/MemoryFlipRenderer";
import { evaluateAnswer } from "@/core/evaluator";

describe("Memory Flip Game (T-009)", () => {
  describe("Memory Flip Adapter", () => {
    it("has correct game type and metadata", () => {
      expect(memoryFlipAdapter.type).toBe("memory-flip");
      expect(memoryFlipAdapter.renderKey).toBe("memory-flip-renderer");
      expect(memoryFlipAdapter.getDefaultAnswer?.()).toEqual({
        matchedPairsCount: 0,
        isBoardCleared: false,
      });
    });

    it("validates conforming questions and rejects malformed ones", () => {
      const validQ = MEMORY_FLIP_SAMPLE_QUESTIONS[0];
      expect(memoryFlipAdapter.validateQuestion(validQ)).toBe(true);

      const invalidQ = {
        ...validQ,
        public_payload: {
          pairsCount: 4,
          cards: validQ.public_payload.cards.slice(0, 5), // Not pairsCount * 2
        },
      };
      expect(memoryFlipAdapter.validateQuestion(invalidQ)).toBe(false);
    });
  });

  describe("Sample Questions Dataset", () => {
    it("contains valid 4-pair and 6-pair boards", () => {
      expect(MEMORY_FLIP_SAMPLE_QUESTIONS.length).toBeGreaterThanOrEqual(2);

      const board4 = MEMORY_FLIP_SAMPLE_QUESTIONS[0];
      expect(board4.public_payload.pairsCount).toBe(4);
      expect(board4.public_payload.cards.length).toBe(8);
      expect(memoryFlipAdapter.validateQuestion(board4)).toBe(true);

      const board6 = MEMORY_FLIP_SAMPLE_QUESTIONS[1];
      expect(board6.public_payload.pairsCount).toBe(6);
      expect(board6.public_payload.cards.length).toBe(12);
      expect(memoryFlipAdapter.validateQuestion(board6)).toBe(true);
    });
  });

  describe("MemoryFlipRenderer Component", () => {
    const samplePayload = MEMORY_FLIP_SAMPLE_QUESTIONS[0].public_payload;

    it("renders board with stats bar and accessible toggle", () => {
      const html = renderToStaticMarkup(
        <MemoryFlipRenderer
          payload={samplePayload}
          onComplete={() => {}}
        />
      );

      expect(html).toContain("Đã ghép:");
      expect(html).toContain("<strong>0</strong> / 4 cặp");
      expect(html).toContain("Chế độ trợ năng");
      expect(html).toContain('role="grid"');
      expect(html).toContain('aria-label="Bảng lật thẻ từ vựng"');
    });

    it("renders exactly 8 cards face-down initially", () => {
      const html = renderToStaticMarkup(
        <MemoryFlipRenderer
          payload={samplePayload}
          onComplete={() => {}}
        />
      );

      const faceDownMatches = html.match(/Lật thẻ/g);
      expect(faceDownMatches?.length).toBe(8);
    });
  });

  describe("Memory Flip Server Evaluation & Scoring", () => {
    const question = MEMORY_FLIP_SAMPLE_QUESTIONS[0];

    it("evaluates completed board with 10 XP", () => {
      const result = evaluateAnswer(question, {
        isBoardCleared: true,
        matchedPairsCount: 4,
      });

      expect(result.correct).toBe(true);
      expect(result.scoreDelta).toBe(10);
      expect(result.explanation).toContain("Colleague");
    });

    it("evaluates incomplete board as incorrect with 0 XP", () => {
      const result = evaluateAnswer(question, {
        isBoardCleared: false,
        matchedPairsCount: 2,
      });

      expect(result.correct).toBe(false);
      expect(result.scoreDelta).toBe(0);
    });
  });
});
