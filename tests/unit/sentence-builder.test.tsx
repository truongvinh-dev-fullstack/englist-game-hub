import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { sentenceBuilderAdapter } from "@/games/sentence-builder/adapter";
import { SENTENCE_BUILDER_SAMPLE_QUESTIONS } from "@/games/sentence-builder/sample-data";
import { SentenceBuilderRenderer } from "@/games/sentence-builder/SentenceBuilderRenderer";
import { evaluateAnswer } from "@/core/evaluator";

describe("Sentence Builder Game (T-010)", () => {
  describe("Sentence Builder Adapter", () => {
    it("has correct game type, metadata, and default answer", () => {
      expect(sentenceBuilderAdapter.type).toBe("sentence-builder");
      expect(sentenceBuilderAdapter.renderKey).toBe("sentence-builder-renderer");
      expect(sentenceBuilderAdapter.title).toBe("Sentence Builder");
      expect(sentenceBuilderAdapter.getDefaultAnswer?.()).toEqual({
        tokenSequence: [],
      });
    });

    it("validates conforming questions and rejects malformed ones", () => {
      const validQ = SENTENCE_BUILDER_SAMPLE_QUESTIONS[0];
      expect(sentenceBuilderAdapter.validateQuestion(validQ)).toBe(true);

      // Question with missing canonicalSequence
      const invalidQ = {
        ...validQ,
        private_solution: {
          canonicalSequence: ["non-existent-id"],
          canonicalSentence: "Invalid sentence",
        },
      };
      expect(sentenceBuilderAdapter.validateQuestion(invalidQ)).toBe(false);
    });
  });

  describe("Sample Questions Dataset", () => {
    it("contains 4 high-quality workplace English sentence questions", () => {
      expect(SENTENCE_BUILDER_SAMPLE_QUESTIONS.length).toBe(4);

      SENTENCE_BUILDER_SAMPLE_QUESTIONS.forEach((q) => {
        expect(sentenceBuilderAdapter.validateQuestion(q)).toBe(true);
        expect(q.public_payload.tokens.length).toBeGreaterThanOrEqual(5);
        expect(q.private_solution.canonicalSequence.length).toBe(
          q.public_payload.tokens.length
        );
      });
    });

    it("includes accepted alternative sequences for flexible grammar", () => {
      const qWithAlternatives = SENTENCE_BUILDER_SAMPLE_QUESTIONS.filter(
        (q) => q.private_solution.acceptedSequences && q.private_solution.acceptedSequences.length > 0
      );
      expect(qWithAlternatives.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("SentenceBuilderRenderer Component", () => {
    const samplePayload = SENTENCE_BUILDER_SAMPLE_QUESTIONS[0].public_payload;

    it("renders Vietnamese meaning prompt and empty drop zone initially", () => {
      const html = renderToStaticMarkup(
        <SentenceBuilderRenderer
          payload={samplePayload}
          selectedSequence={[]}
          onSequenceChange={() => {}}
          onSubmit={() => {}}
        />
      );

      expect(html).toContain(samplePayload.promptVi);
      expect(html).toContain("Chạm vào các từ bên dưới theo thứ tự");
      expect(html).toContain("Kho từ vựng có sẵn");
      expect(html).toContain("0 / 6 từ");
    });

    it("renders selected tokens in order and marks pool items as selected", () => {
      const selectedSequence = ["t1", "t2"]; // "I", "usually"
      const html = renderToStaticMarkup(
        <SentenceBuilderRenderer
          payload={samplePayload}
          selectedSequence={selectedSequence}
          onSequenceChange={() => {}}
          onSubmit={() => {}}
        />
      );

      // Selected tokens rendered in constructed sentence area
      expect(html).toContain("Xóa từ I");
      expect(html).toContain("Xóa từ usually");
      expect(html).toContain("2 / 6 từ");
      expect(html).toContain("Đặt lại");
    });
  });

  describe("Sentence Builder Server Evaluation & Scoring", () => {
    const question1 = SENTENCE_BUILDER_SAMPLE_QUESTIONS[0]; // "I usually check my emails in the morning."

    it("awards 10 XP for canonical sequence matching", () => {
      const result = evaluateAnswer(question1, {
        tokenSequence: ["t1", "t2", "t3", "t4", "t5", "t6"],
      });

      expect(result.correct).toBe(true);
      expect(result.scoreDelta).toBe(10);
      expect(result.explanation).toContain("thì hiện tại đơn");
    });

    it("awards 10 XP for accepted alternative sequence", () => {
      // In the morning, I usually check my emails.
      const result = evaluateAnswer(question1, {
        tokenSequence: ["t6", "t1", "t2", "t3", "t4", "t5"],
      });

      expect(result.correct).toBe(true);
      expect(result.scoreDelta).toBe(10);
    });

    it("evaluates incorrect order as false with 0 XP and canonical sentence reveal", () => {
      // Incorrect grammar: "Usually I check emails my in the morning."
      const result = evaluateAnswer(question1, {
        tokenSequence: ["t2", "t1", "t3", "t5", "t4", "t6"],
      });

      expect(result.correct).toBe(false);
      expect(result.scoreDelta).toBe(0);
      expect(result.correctAnswer).toBe("I usually check my emails in the morning.");
    });

    it("handles partial sequences and empty answers safely", () => {
      const partialResult = evaluateAnswer(question1, {
        tokenSequence: ["t1", "t2"],
      });
      expect(partialResult.correct).toBe(false);
      expect(partialResult.scoreDelta).toBe(0);

      const emptyResult = evaluateAnswer(question1, {});
      expect(emptyResult.correct).toBe(false);
      expect(emptyResult.scoreDelta).toBe(0);
    });
  });
});
