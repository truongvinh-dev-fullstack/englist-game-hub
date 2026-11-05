import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { roleplayAdapter } from "@/games/roleplay/adapter";
import { ROLEPLAY_SAMPLE_QUESTIONS } from "@/games/roleplay/sample-data";
import { RoleplayRenderer } from "@/games/roleplay/RoleplayRenderer";
import { evaluateAnswer } from "@/core/evaluator";

describe("Roleplay Simulator Game (T-013)", () => {
  describe("Roleplay Adapter", () => {
    it("has correct game type, metadata, and default answer", () => {
      expect(roleplayAdapter.type).toBe("roleplay");
      expect(roleplayAdapter.renderKey).toBe("roleplay-renderer");
      expect(roleplayAdapter.title).toBe("Roleplay Simulator");
      expect(roleplayAdapter.getDefaultAnswer?.()).toEqual({
        selectedChoiceId: undefined,
      });
    });

    it("validates conforming questions and rejects malformed ones", () => {
      const validQ = ROLEPLAY_SAMPLE_QUESTIONS[0];
      expect(roleplayAdapter.validateQuestion(validQ)).toBe(true);

      // Malformed question where an evaluation choiceId does not exist in choices
      const invalidEvalQ = {
        ...validQ,
        private_solution: {
          evaluations: [
            ...validQ.private_solution.evaluations.slice(0, 2),
            {
              choiceId: "non-existent-choice",
              rating: "appropriate" as const,
              scoreDelta: 10,
              feedbackVi: "Invalid choice feedback",
            },
          ],
        },
      };
      expect(roleplayAdapter.validateQuestion(invalidEvalQ)).toBe(false);
    });
  });

  describe("Sample Questions Dataset & Branch Coverage", () => {
    it("contains 4 curated workplace negotiation and communication scenarios", () => {
      expect(ROLEPLAY_SAMPLE_QUESTIONS.length).toBe(4);

      ROLEPLAY_SAMPLE_QUESTIONS.forEach((q) => {
        expect(roleplayAdapter.validateQuestion(q)).toBe(true);
        expect(q.public_payload.choices.length).toBeGreaterThanOrEqual(3);
        expect(q.public_payload.situation.length).toBeGreaterThan(10);
        expect(q.public_payload.npcRole.length).toBeGreaterThan(3);
        expect(q.public_payload.npcText.length).toBeGreaterThan(5);
      });
    });

    it("verifies full branch coverage across appropriate, acceptable, and inappropriate rubrics", () => {
      let hasAppropriate = false;
      let hasAcceptable = false;
      let hasInappropriate = false;

      ROLEPLAY_SAMPLE_QUESTIONS.forEach((q) => {
        // Every choice must have a corresponding evaluation
        expect(q.private_solution.evaluations.length).toBe(q.public_payload.choices.length);

        q.private_solution.evaluations.forEach((ev) => {
          expect(ev.feedbackVi.length).toBeGreaterThan(10);
          if (ev.rating === "appropriate") {
            hasAppropriate = true;
            expect(ev.scoreDelta).toBe(10);
          } else if (ev.rating === "acceptable") {
            hasAcceptable = true;
            expect(ev.scoreDelta).toBe(5);
          } else if (ev.rating === "inappropriate") {
            hasInappropriate = true;
            expect(ev.scoreDelta).toBe(0);
          }
        });
      });

      expect(hasAppropriate).toBe(true);
      expect(hasAcceptable).toBe(true);
      expect(hasInappropriate).toBe(true);
    });
  });

  describe("RoleplayRenderer Component", () => {
    const sampleQuestion = ROLEPLAY_SAMPLE_QUESTIONS[0];
    const samplePayload = sampleQuestion.public_payload;

    it("renders scenario context, NPC dialogue, and player choices", () => {
      const html = renderToStaticMarkup(
        <RoleplayRenderer
          payload={samplePayload}
          selectedChoiceId={null}
          onSelectChoice={() => {}}
          onSubmit={() => {}}
        />
      );

      expect(html).toContain("Bối cảnh tình huống");
      expect(html).toContain(samplePayload.situation);
      expect(html).toContain(samplePayload.npcRole);
      expect(html).toContain('role="radiogroup"');

      // Verify choices are rendered
      samplePayload.choices.forEach((c) => {
        const escaped = c.text.replace(/'/g, "&#x27;");
        expect(html).toContain(escaped);
      });
    });

    it("highlights selected player response choice", () => {
      const html = renderToStaticMarkup(
        <RoleplayRenderer
          payload={samplePayload}
          selectedChoiceId="c1"
          onSelectChoice={() => {}}
          onSubmit={() => {}}
        />
      );

      expect(html).toContain("Đã chọn câu phản hồi");
      expect(html).toContain('aria-checked="true"');
    });
  });

  describe("Roleplay Server Evaluation & Scoring", () => {
    const question1 = ROLEPLAY_SAMPLE_QUESTIONS[0]; // Deadline negotiation

    it("awards 10 XP and marks correct for 'appropriate' response", () => {
      const result = evaluateAnswer(question1, {
        selectedChoiceId: "c1", // Polite extension request
      });

      expect(result.correct).toBe(true);
      expect(result.scoreDelta).toBe(10);
      expect(result.explanation).toContain("Rất xuất sắc");
    });

    it("awards 5 XP and marks false for 'acceptable' response", () => {
      const result = evaluateAnswer(question1, {
        selectedChoiceId: "c3", // "no promises"
      });

      expect(result.correct).toBe(false);
      expect(result.scoreDelta).toBe(5);
      expect(result.explanation).toContain("Tạm chấp nhận");
    });

    it("awards 0 XP and marks false for 'inappropriate' response", () => {
      const result = evaluateAnswer(question1, {
        selectedChoiceId: "c2", // Blaming boss
      });

      expect(result.correct).toBe(false);
      expect(result.scoreDelta).toBe(0);
      expect(result.explanation).toContain("Chưa phù hợp");
    });

    it("safely handles non-existent or empty choiceId", () => {
      const result = evaluateAnswer(question1, {
        selectedChoiceId: "unknown-choice",
      });

      expect(result.correct).toBe(false);
      expect(result.scoreDelta).toBe(0);

      const emptyResult = evaluateAnswer(question1, {});
      expect(emptyResult.correct).toBe(false);
      expect(emptyResult.scoreDelta).toBe(0);
    });
  });
});

