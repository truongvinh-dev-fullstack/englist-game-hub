import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { errorDetectiveAdapter } from "@/games/error-detective/adapter";
import { ERROR_DETECTIVE_SAMPLE_QUESTIONS } from "@/games/error-detective/sample-data";
import { ErrorDetectiveRenderer } from "@/games/error-detective/ErrorDetectiveRenderer";
import { evaluateAnswer } from "@/core/evaluator";

describe("Error Detective Game (T-011)", () => {
  describe("Error Detective Adapter", () => {
    it("has correct game type, metadata, and default answer", () => {
      expect(errorDetectiveAdapter.type).toBe("error-detective");
      expect(errorDetectiveAdapter.renderKey).toBe("error-detective-renderer");
      expect(errorDetectiveAdapter.title).toBe("Error Detective");
      expect(errorDetectiveAdapter.getDefaultAnswer?.()).toEqual({
        selectedSegmentId: undefined,
        selectedOptionId: undefined,
      });
    });

    it("validates conforming questions and rejects malformed ones", () => {
      const validQ = ERROR_DETECTIVE_SAMPLE_QUESTIONS[0];
      expect(errorDetectiveAdapter.validateQuestion(validQ)).toBe(true);

      // Malformed question with non-existent errorSegmentId
      const invalidSegmentQ = {
        ...validQ,
        private_solution: {
          ...validQ.private_solution,
          errorSegmentId: "non-existent-seg",
        },
      };
      expect(errorDetectiveAdapter.validateQuestion(invalidSegmentQ)).toBe(false);

      // Malformed question with non-existent correctOptionId
      const invalidOptionQ = {
        ...validQ,
        private_solution: {
          ...validQ.private_solution,
          correctOptionId: "non-existent-opt",
        },
      };
      expect(errorDetectiveAdapter.validateQuestion(invalidOptionQ)).toBe(false);
    });
  });

  describe("Sample Questions Dataset & Non-Ambiguity Check", () => {
    it("contains 4 high-quality workplace error detection questions", () => {
      expect(ERROR_DETECTIVE_SAMPLE_QUESTIONS.length).toBe(4);

      ERROR_DETECTIVE_SAMPLE_QUESTIONS.forEach((q) => {
        expect(errorDetectiveAdapter.validateQuestion(q)).toBe(true);
        expect(q.public_payload.segments.length).toBeGreaterThanOrEqual(3);
        expect(q.public_payload.correctionOptions.length).toBeGreaterThanOrEqual(3);
        expect(q.private_solution.grammarConcept.length).toBeGreaterThan(5);
        expect(q.private_solution.correctedSentence).not.toBe(q.public_payload.sentence);
      });
    });

    it("verifies unambiguous single error per question", () => {
      ERROR_DETECTIVE_SAMPLE_QUESTIONS.forEach((q) => {
        const matchingSegments = q.public_payload.segments.filter(
          (s) => s.id === q.private_solution.errorSegmentId
        );
        expect(matchingSegments.length).toBe(1);

        const matchingOptions = q.public_payload.correctionOptions.filter(
          (o) => o.id === q.private_solution.correctOptionId
        );
        expect(matchingOptions.length).toBe(1);
      });
    });
  });

  describe("ErrorDetectiveRenderer Component", () => {
    const samplePayload = ERROR_DETECTIVE_SAMPLE_QUESTIONS[0].public_payload;

    it("renders interactive sentence segments and prompt guide", () => {
      const html = renderToStaticMarkup(
        <ErrorDetectiveRenderer
          payload={samplePayload}
          selectedSegmentId={null}
          selectedOptionId={null}
          onSelectSegment={() => {}}
          onSelectOption={() => {}}
          onSubmit={() => {}}
        />
      );

      expect(html).toContain("Bước 1: Chạm vào cụm từ có lỗi sai");
      expect(html).toContain("Bước 2: Chọn phương án sửa");
      expect(html).toContain("Chạm vào một cụm từ ở trên để tiến hành sửa lỗi");

      // Verify all segments are rendered
      samplePayload.segments.forEach((seg) => {
        const escaped = seg.text.replace(/'/g, "&#x27;");
        expect(html).toContain(escaped);
      });
    });

    it("highlights selected segment and unlocks correction options", () => {
      const html = renderToStaticMarkup(
        <ErrorDetectiveRenderer
          payload={samplePayload}
          selectedSegmentId="s2" // "don't agree"
          selectedOptionId="opt1" // "doesn't agree"
          onSelectSegment={() => {}}
          onSelectOption={() => {}}
          onSubmit={() => {}}
        />
      );

      expect(html).toContain("Đã chọn điểm nghi vấn");
      expect(html).toContain("Phân đoạn đang chọn:");
      expect(html).toContain("don&#x27;t agree");
      expect(html).toContain('aria-checked="true"');
      expect(html).toContain("1 / 1 đã chọn");
    });
  });

  describe("Error Detective Server Evaluation & Scoring", () => {
    const question1 = ERROR_DETECTIVE_SAMPLE_QUESTIONS[0];

    it("awards 10 XP when both error segment and correction option are correct", () => {
      const result = evaluateAnswer(question1, {
        selectedSegmentId: "s2",
        selectedOptionId: "opt1",
      });

      expect(result.correct).toBe(true);
      expect(result.scoreDelta).toBe(10);
      expect(result.explanation).toContain("doesn't");
      expect(result.correctAnswer).toBe("He doesn't agree with the new project schedule.");
    });

    it("evaluates correct segment but incorrect option as false with 0 XP", () => {
      const result = evaluateAnswer(question1, {
        selectedSegmentId: "s2",
        selectedOptionId: "opt2", // "not agree"
      });

      expect(result.correct).toBe(false);
      expect(result.scoreDelta).toBe(0);
      expect(result.correctAnswer).toBe("He doesn't agree with the new project schedule.");
    });

    it("evaluates incorrect segment with 0 XP regardless of option", () => {
      const result = evaluateAnswer(question1, {
        selectedSegmentId: "s1", // "He"
        selectedOptionId: "opt1",
      });

      expect(result.correct).toBe(false);
      expect(result.scoreDelta).toBe(0);
    });

    it("safely handles empty or missing answer payload", () => {
      const emptyResult = evaluateAnswer(question1, {});
      expect(emptyResult.correct).toBe(false);
      expect(emptyResult.scoreDelta).toBe(0);

      const nullResult = evaluateAnswer(question1, null);
      expect(nullResult.correct).toBe(false);
      expect(nullResult.scoreDelta).toBe(0);
    });
  });
});
