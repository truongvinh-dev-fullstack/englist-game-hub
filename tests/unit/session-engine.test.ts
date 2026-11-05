import { describe, it, expect } from "vitest";
import { evaluateAnswer } from "@/core/evaluator";
import { calculateBoundedXP, MAX_SESSION_XP_CAP } from "@/core/scoring";
import {
  createSessionInputSchema,
  submitAnswerInputSchema,
} from "@/lib/validations/session";
import type { AnyQuestion } from "@/lib/validations/content";

const TEST_TOPIC_ID = "11111111-1111-1111-1111-111111111111";

describe("Session Engine & Idempotent Scoring (T-006)", () => {
  describe("XP Bounding & Safety Logic", () => {
    it("accumulates valid scores up to the maximum session cap (100 XP)", () => {
      expect(calculateBoundedXP(0, 10)).toBe(10);
      expect(calculateBoundedXP(90, 10)).toBe(100);
      expect(calculateBoundedXP(100, 10)).toBe(MAX_SESSION_XP_CAP);
      expect(calculateBoundedXP(95, 20)).toBe(MAX_SESSION_XP_CAP);
    });

    it("prevents negative scores or delta manipulation", () => {
      expect(calculateBoundedXP(-50, 10)).toBe(10);
      expect(calculateBoundedXP(50, -20)).toBe(50);
    });
  });

  describe("Session Input Validation Schemas", () => {
    it("validates valid create session input", () => {
      const valid = {
        gameSlug: "sentence-builder",
        topicId: TEST_TOPIC_ID,
        difficulty: "A1",
      };
      const result = createSessionInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects create session input with empty gameSlug", () => {
      const invalid = { gameSlug: "   " };
      const result = createSessionInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("requires requestId for answer submission to guarantee idempotency", () => {
      const valid = {
        questionId: TEST_TOPIC_ID,
        answer: { selectedOptionId: "opt-1" },
        requestId: "req_unique_12345",
      };
      const result = submitAnswerInputSchema.safeParse(valid);
      expect(result.success).toBe(true);

      const missingRequestId = {
        questionId: TEST_TOPIC_ID,
        answer: { selectedOptionId: "opt-1" },
      };
      const invalidResult = submitAnswerInputSchema.safeParse(missingRequestId);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe("Game Evaluators Logic", () => {
    it("evaluates Listen & Choose correctly", () => {
      const question: AnyQuestion = {
        game_type: "listen-choose",
        topic_id: TEST_TOPIC_ID,
        difficulty: "A1",
        skill: "listening",
        prompt: "Nghe câu thoại và chọn đáp án:",
        explanation_vi: "Đoạn ghi âm nói về cuộc họp.",
        concept_tags: ["office"],
        status: "published",
        version: 1,
        public_payload: {
          audioPath: "tts",
          speechText: "The meeting starts at 2 PM.",
          options: [
            { id: "opt-1", text: "Cuộc họp lúc 2:00 PM" },
            { id: "opt-2", text: "Cuộc họp bị hủy" },
          ],
        },
        private_solution: {
          correctOptionId: "opt-1",
          transcriptEn: "The meeting starts at 2 PM.",
        },
      };

      const correctResult = evaluateAnswer(question, { selectedOptionId: "opt-1" });
      expect(correctResult.correct).toBe(true);
      expect(correctResult.scoreDelta).toBe(10);

      const wrongResult = evaluateAnswer(question, { selectedOptionId: "opt-2" });
      expect(wrongResult.correct).toBe(false);
      expect(wrongResult.scoreDelta).toBe(0);
    });

    it("evaluates Sentence Builder with canonical and accepted alternative sequences", () => {
      const question: AnyQuestion = {
        game_type: "sentence-builder",
        topic_id: TEST_TOPIC_ID,
        difficulty: "A1",
        skill: "grammar",
        prompt: "Sắp xếp từ.",
        explanation_vi: "Thì hiện tại đơn.",
        concept_tags: ["grammar"],
        status: "published",
        version: 1,
        public_payload: {
          promptVi: "Tôi thường kiểm tra email.",
          tokens: [
            { id: "t1", text: "I" },
            { id: "t2", text: "usually" },
            { id: "t3", text: "check" },
            { id: "t4", text: "emails." },
          ],
        },
        private_solution: {
          canonicalSequence: ["t1", "t2", "t3", "t4"],
          canonicalSentence: "I usually check emails.",
          acceptedSequences: [
            ["t2", "t1", "t3", "t4"], // "Usually, I check emails."
          ],
        },
      };

      // Canonical match
      const canonicalMatch = evaluateAnswer(question, { tokenSequence: ["t1", "t2", "t3", "t4"] });
      expect(canonicalMatch.correct).toBe(true);
      expect(canonicalMatch.scoreDelta).toBe(10);

      // Accepted alternative match
      const altMatch = evaluateAnswer(question, { tokenSequence: ["t2", "t1", "t3", "t4"] });
      expect(altMatch.correct).toBe(true);
      expect(altMatch.scoreDelta).toBe(10);

      // Wrong sequence
      const wrongSeq = evaluateAnswer(question, { tokenSequence: ["t4", "t3", "t2", "t1"] });
      expect(wrongSeq.correct).toBe(false);
      expect(wrongSeq.scoreDelta).toBe(0);
    });

    it("evaluates Error Detective requiring both error segment and correction option", () => {
      const question: AnyQuestion = {
        game_type: "error-detective",
        topic_id: TEST_TOPIC_ID,
        difficulty: "A2",
        skill: "grammar",
        prompt: "Sửa lỗi trong câu.",
        explanation_vi: "Động từ số ít thêm -s.",
        concept_tags: ["verbs"],
        status: "published",
        version: 1,
        public_payload: {
          sentence: "He go to the office.",
          segments: [
            { id: "s1", text: "He" },
            { id: "s2", text: "go" },
            { id: "s3", text: "to the office." },
          ],
          correctionOptions: [
            { id: "c1", text: "goes" },
            { id: "c2", text: "went" },
          ],
        },
        private_solution: {
          errorSegmentId: "s2",
          correctOptionId: "c1",
          grammarConcept: "Subject-Verb Agreement",
          correctedSentence: "He goes to the office.",
        },
      };

      // Both correct
      const fullCorrect = evaluateAnswer(question, { selectedSegmentId: "s2", selectedOptionId: "c1" });
      expect(fullCorrect.correct).toBe(true);
      expect(fullCorrect.scoreDelta).toBe(10);

      // Wrong segment but right correction
      const wrongSegment = evaluateAnswer(question, { selectedSegmentId: "s1", selectedOptionId: "c1" });
      expect(wrongSegment.correct).toBe(false);
      expect(wrongSegment.scoreDelta).toBe(0);

      // Right segment but wrong correction
      const wrongCorrection = evaluateAnswer(question, { selectedSegmentId: "s2", selectedOptionId: "c2" });
      expect(wrongCorrection.correct).toBe(false);
      expect(wrongCorrection.scoreDelta).toBe(0);
    });

    it("evaluates Listen & Choose and reveals transcriptEn only in feedback", () => {
      const question: AnyQuestion = {
        game_type: "listen-choose",
        topic_id: TEST_TOPIC_ID,
        difficulty: "A2",
        skill: "listening",
        prompt: "Nghe và chọn câu trả lời.",
        explanation_vi: "Xác nhận lịch họp 3 giờ chiều.",
        concept_tags: ["listening"],
        status: "published",
        version: 1,
        public_payload: {
          audioPath: "/audio/meeting.mp3",
          options: [
            { id: "o1", text: "Sure, see you at 3 PM." },
            { id: "o2", text: "No, I am cold." },
          ],
        },
        private_solution: {
          correctOptionId: "o1",
          transcriptEn: "Could we meet at 3 PM?",
        },
      };

      const result = evaluateAnswer(question, { selectedOptionId: "o1" });
      expect(result.correct).toBe(true);
      expect(result.scoreDelta).toBe(10);
      expect(result.correctAnswer).toEqual({
        correctOptionId: "o1",
        transcriptEn: "Could we meet at 3 PM?",
      });
    });

    it("evaluates Roleplay Simulator based on authored rubric ratings", () => {
      const question: AnyQuestion = {
        game_type: "roleplay",
        topic_id: TEST_TOPIC_ID,
        difficulty: "B1",
        skill: "speaking",
        prompt: "Hội thoại đối tác.",
        explanation_vi: "Lịch sự trong công sở.",
        concept_tags: ["roleplay"],
        status: "published",
        version: 1,
        public_payload: {
          situation: "Khách hàng cần gấp báo cáo.",
          npcRole: "Khách hàng",
          npcText: "Can I have the report today?",
          choices: [
            { id: "ch1", text: "I will do my best to send a summary today." },
            { id: "ch2", text: "No, wait until Friday." },
          ],
          isTerminal: false,
        },
        private_solution: {
          evaluations: [
            { choiceId: "ch1", rating: "appropriate", scoreDelta: 10, feedbackVi: "Rất lịch sự." },
            { choiceId: "ch2", rating: "inappropriate", scoreDelta: 0, feedbackVi: "Thô lỗ." },
          ],
        },
      };

      const appResult = evaluateAnswer(question, { selectedChoiceId: "ch1" });
      expect(appResult.correct).toBe(true);
      expect(appResult.scoreDelta).toBe(10);

      const inappResult = evaluateAnswer(question, { selectedChoiceId: "ch2" });
      expect(inappResult.correct).toBe(false);
      expect(inappResult.scoreDelta).toBe(0);
    });
  });
});

