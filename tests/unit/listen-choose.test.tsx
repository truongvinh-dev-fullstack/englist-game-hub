import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { listenChooseAdapter } from "@/games/listen-choose/adapter";
import { LISTEN_CHOOSE_SAMPLE_QUESTIONS } from "@/games/listen-choose/sample-data";
import { ListenChooseRenderer } from "@/games/listen-choose/ListenChooseRenderer";
import { listenChooseQuestionSchema } from "@/lib/validations/content/listen-choose";
import { evaluateAnswer } from "@/core/evaluator";

describe("Listen & Choose Game (T-012)", () => {
  describe("Listen & Choose Adapter", () => {
    it("has correct game type, metadata, and default answer", () => {
      expect(listenChooseAdapter.type).toBe("listen-choose");
      expect(listenChooseAdapter.renderKey).toBe("listen-choose-renderer");
      expect(listenChooseAdapter.title).toBe("Listen & Choose");
      expect(listenChooseAdapter.getDefaultAnswer?.()).toEqual({
        selectedOptionId: undefined,
      });
    });

    it("validates conforming questions and rejects malformed ones", () => {
      const validQ = LISTEN_CHOOSE_SAMPLE_QUESTIONS[0];
      expect(listenChooseAdapter.validateQuestion(validQ)).toBe(true);

      // Malformed question with non-existent correctOptionId
      const invalidOptionQ = {
        ...validQ,
        private_solution: {
          ...validQ.private_solution,
          correctOptionId: "non-existent-option",
        },
      };
      expect(listenChooseAdapter.validateQuestion(invalidOptionQ)).toBe(false);
    });
  });

  describe("Zero-Leakage Security Invariant", () => {
    it("strictly rejects any public_payload containing transcript", () => {
      const validQ = LISTEN_CHOOSE_SAMPLE_QUESTIONS[0];
      const leakedQ = {
        ...validQ,
        public_payload: {
          ...validQ.public_payload,
          transcript: "The secret leaked audio transcript",
        },
      };

      const parseResult = listenChooseQuestionSchema.safeParse(leakedQ);
      expect(parseResult.success).toBe(false);
    });

    it("strictly rejects public_payload containing transcriptEn", () => {
      const validQ = LISTEN_CHOOSE_SAMPLE_QUESTIONS[0];
      const leakedQ = {
        ...validQ,
        public_payload: {
          ...validQ.public_payload,
          transcriptEn: "The secret leaked audio transcript",
        },
      };

      const parseResult = listenChooseQuestionSchema.safeParse(leakedQ);
      expect(parseResult.success).toBe(false);
    });
  });

  describe("Sample Questions Dataset", () => {
    it("contains 4 high-quality workplace listening comprehension questions", () => {
      expect(LISTEN_CHOOSE_SAMPLE_QUESTIONS.length).toBe(4);

      LISTEN_CHOOSE_SAMPLE_QUESTIONS.forEach((q) => {
        expect(listenChooseAdapter.validateQuestion(q)).toBe(true);
        expect(q.public_payload.audioPath.length).toBeGreaterThan(0);
        expect(q.public_payload.options.length).toBe(4);
        expect(q.private_solution.transcriptEn.length).toBeGreaterThan(10);
      });
    });
  });

  describe("ListenChooseRenderer Component", () => {
    const sampleQuestion = LISTEN_CHOOSE_SAMPLE_QUESTIONS[0];
    const samplePayload = sampleQuestion.public_payload;

    it("renders audio control button and 4 option choices", () => {
      const html = renderToStaticMarkup(
        <ListenChooseRenderer
          payload={samplePayload}
          selectedOptionId={null}
          onSelectOption={() => {}}
          onSubmit={() => {}}
        />
      );

      expect(html).toContain('aria-label="Bấm để nghe âm thanh"');
      expect(html).toContain("Chạm vào loa để bắt đầu nghe");
      expect(html).toContain('role="radiogroup"');

      // Verify all 4 options are rendered
      samplePayload.options.forEach((opt) => {
        expect(html).toContain(opt.text);
      });
    });

    it("never leaks English transcript into DOM before submission", () => {
      const html = renderToStaticMarkup(
        <ListenChooseRenderer
          payload={samplePayload}
          selectedOptionId="opt1"
          onSelectOption={() => {}}
          onSubmit={() => {}}
        />
      );

      // Secret transcript MUST NOT appear in rendered UI
      expect(html).not.toContain(sampleQuestion.private_solution.transcriptEn);
      expect(html).toContain("Văn bản lời đọc (transcript) sẽ hiển thị chi tiết sau khi bạn nộp bài");
      expect(html).toContain('aria-checked="true"');
      expect(html).toContain("Tốc độ: 0.9x (Chuẩn)");
    });

    it("renders TTS engine badge when audioPath is 'tts'", () => {
      const ttsPayload = {
        audioPath: "tts",
        speechText: "Please check the schedule.",
        options: [
          { id: "opt1", text: "Kiểm tra lịch trình" },
          { id: "opt2", text: "Hủy cuộc họp" },
        ],
      };

      const html = renderToStaticMarkup(
        <ListenChooseRenderer
          payload={ttsPayload}
          selectedOptionId={null}
          onSelectOption={() => {}}
          onSubmit={() => {}}
        />
      );

      expect(html).toContain("Phát âm chuẩn giọng đọc bản ngữ (TTS)");
      expect(html).not.toContain("Please check the schedule.");
    });

    it("accepts question with optional audioPath defaulting to 'tts' and speechText", () => {
      const qWithTts = {
        ...sampleQuestion,
        public_payload: {
          speechText: "Please sign the documents before 5 PM.",
          options: [
            { id: "opt1", text: "Ký tài liệu trước 5 giờ chiều" },
            { id: "opt2", text: "Gửi tài liệu ngày mai" },
          ],
        },
        private_solution: {
          correctOptionId: "opt1",
          transcriptEn: "Please sign the documents before 5 PM.",
        },
      };

      const parsed = listenChooseQuestionSchema.parse(qWithTts);
      expect(parsed.public_payload.audioPath).toBe("tts");
      expect(parsed.public_payload.speechText).toBe("Please sign the documents before 5 PM.");
    });
  });

  describe("Listen & Choose Server Evaluation & Scoring", () => {
    const question1 = LISTEN_CHOOSE_SAMPLE_QUESTIONS[0];

    it("awards 10 XP and reveals transcript on correct option choice", () => {
      const result = evaluateAnswer(question1, {
        selectedOptionId: "opt1",
      });

      expect(result.correct).toBe(true);
      expect(result.scoreDelta).toBe(10);
      expect(result.explanation).toContain("rescheduled");
      expect(result.correctAnswer).toEqual({
        correctOptionId: "opt1",
        transcriptEn: "The team meeting has been rescheduled to 2 PM.",
      });
    });

    it("evaluates wrong option as false with 0 XP and reveals transcript", () => {
      const result = evaluateAnswer(question1, {
        selectedOptionId: "opt2",
      });

      expect(result.correct).toBe(false);
      expect(result.scoreDelta).toBe(0);
      expect(result.correctAnswer).toEqual({
        correctOptionId: "opt1",
        transcriptEn: "The team meeting has been rescheduled to 2 PM.",
      });
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

