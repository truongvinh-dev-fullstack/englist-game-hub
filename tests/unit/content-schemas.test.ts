import { describe, it, expect } from "vitest";
import { validateQuestion } from "@/lib/validations/content";
import { validateSeedBatch } from "@/lib/validations/content/seed-validator";

const TEST_TOPIC_ID = "11111111-1111-1111-1111-111111111111";

describe("Content Schemas & Seed Validator (T-005)", () => {
  describe("Memory Flip Schema", () => {
    const validMemoryFlip = {
      game_type: "memory-flip",
      topic_id: TEST_TOPIC_ID,
      difficulty: "A1",
      skill: "vocabulary",
      prompt: "Lật các thẻ từ vựng và nghĩa tiếng Việt tương ứng.",
      explanation_vi: "Ghép đúng các cặp từ vựng công sở thông dụng.",
      concept_tags: ["meeting", "vocabulary"],
      status: "published",
      public_payload: {
        pairsCount: 4,
        cards: [
          { id: "c1", pairId: "p1", content: "Agenda", type: "en" },
          { id: "c2", pairId: "p1", content: "Chương trình họp", type: "vi" },
          { id: "c3", pairId: "p2", content: "Minutes", type: "en" },
          { id: "c4", pairId: "p2", content: "Biên bản cuộc họp", type: "vi" },
          { id: "c5", pairId: "p3", content: "Deadline", type: "en" },
          { id: "c6", pairId: "p3", content: "Hạn chót", type: "vi" },
          { id: "c7", pairId: "p4", content: "Colleague", type: "en" },
          { id: "c8", pairId: "p4", content: "Đồng nghiệp", type: "vi" },
        ],
      },
      private_solution: {
        pairs: [
          { pairId: "p1", en: "Agenda", vi: "Chương trình họp" },
          { pairId: "p2", en: "Minutes", vi: "Biên bản cuộc họp" },
          { pairId: "p3", en: "Deadline", vi: "Hạn chót" },
          { pairId: "p4", en: "Colleague", vi: "Đồng nghiệp" },
        ],
      },
    };

    it("validates a fully conforming Memory Flip question", () => {
      const res = validateQuestion(validMemoryFlip);
      expect(res.success).toBe(true);
    });

    it("rejects Memory Flip when cards count does not match pairsCount * 2", () => {
      const invalid = {
        ...validMemoryFlip,
        public_payload: {
          ...validMemoryFlip.public_payload,
          cards: validMemoryFlip.public_payload.cards.slice(0, 6),
        },
      };
      const res = validateQuestion(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe("Sentence Builder Schema", () => {
    const validSentenceBuilder = {
      game_type: "sentence-builder",
      topic_id: TEST_TOPIC_ID,
      difficulty: "A1",
      skill: "grammar",
      prompt: "Sắp xếp các từ thành câu hoàn chỉnh.",
      explanation_vi: "Cấu trúc thì hiện tại đơn với trạng từ chỉ tần suất đứng trước động từ thường.",
      concept_tags: ["present-simple", "frequency-adverbs"],
      status: "published",
      public_payload: {
        promptVi: "Tôi thường xuyên kiểm tra email vào buổi sáng.",
        tokens: [
          { id: "t1", text: "I" },
          { id: "t2", text: "usually" },
          { id: "t3", text: "check" },
          { id: "t4", text: "my" },
          { id: "t5", text: "emails" },
          { id: "t6", text: "in the morning." },
        ],
      },
      private_solution: {
        canonicalSequence: ["t1", "t2", "t3", "t4", "t5", "t6"],
        canonicalSentence: "I usually check my emails in the morning.",
      },
    };

    it("validates a conforming Sentence Builder question", () => {
      const res = validateQuestion(validSentenceBuilder);
      expect(res.success).toBe(true);
    });

    it("rejects Sentence Builder when canonicalSequence contains invalid token ID", () => {
      const invalid = {
        ...validSentenceBuilder,
        private_solution: {
          ...validSentenceBuilder.private_solution,
          canonicalSequence: ["t1", "t2", "t3", "t4", "t5", "t-unknown"],
        },
      };
      const res = validateQuestion(invalid);
      expect(res.success).toBe(false);
    });

    it("supports optional accepted alternative sequences", () => {
      const withAlternative = {
        ...validSentenceBuilder,
        private_solution: {
          ...validSentenceBuilder.private_solution,
          acceptedSequences: [
            ["t1", "t2", "t3", "t4", "t5", "t6"],
            ["t6", "t1", "t2", "t3", "t4", "t5"], // "In the morning, I usually check my emails"
          ],
        },
      };
      const res = validateQuestion(withAlternative);
      expect(res.success).toBe(true);
    });
  });

  describe("Error Detective Schema", () => {
    const validErrorDetective = {
      game_type: "error-detective",
      topic_id: TEST_TOPIC_ID,
      difficulty: "A2",
      skill: "grammar",
      prompt: "Tìm và sửa lỗi sai trong câu sau.",
      explanation_vi: "Chủ ngữ số ít 'She' ở thì hiện tại đơn yêu cầu động từ thêm -s/es: 'wants' thay vì 'want'.",
      concept_tags: ["subject-verb-agreement"],
      status: "published",
      public_payload: {
        sentence: "She want to reschedule the project review.",
        segments: [
          { id: "s1", text: "She" },
          { id: "s2", text: "want" },
          { id: "s3", text: "to reschedule" },
          { id: "s4", text: "the project review." },
        ],
        correctionOptions: [
          { id: "opt-1", text: "wants" },
          { id: "opt-2", text: "wanted" },
          { id: "opt-3", text: "is wanting" },
        ],
      },
      private_solution: {
        errorSegmentId: "s2",
        correctOptionId: "opt-1",
        grammarConcept: "Subject-Verb Agreement",
        correctedSentence: "She wants to reschedule the project review.",
      },
    };

    it("validates a conforming Error Detective question", () => {
      const res = validateQuestion(validErrorDetective);
      expect(res.success).toBe(true);
    });

    it("rejects Error Detective when errorSegmentId is not in segments", () => {
      const invalid = {
        ...validErrorDetective,
        private_solution: {
          ...validErrorDetective.private_solution,
          errorSegmentId: "s-invalid",
        },
      };
      const res = validateQuestion(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe("Listen & Choose Schema (Security & Zero Leakage)", () => {
    const validListenChoose = {
      game_type: "listen-choose",
      topic_id: TEST_TOPIC_ID,
      difficulty: "A2",
      skill: "listening",
      prompt: "Nghe đoạn hội thoại và chọn phương án trả lời phù hợp nhất.",
      explanation_vi: "'Could we push back the meeting to 3 PM?' có nghĩa là dời lịch sang 3 giờ chiều.",
      concept_tags: ["scheduling", "meeting-phrases"],
      status: "published",
      public_payload: {
        audioPath: "/audio/reschedule_meeting.mp3",
        options: [
          { id: "o1", text: "Sure, 3 PM works for me." },
          { id: "o2", text: "Yes, I am fine." },
          { id: "o3", text: "I pushed the door." },
          { id: "o4", text: "No, it is a table." },
        ],
      },
      private_solution: {
        correctOptionId: "o1",
        transcriptEn: "Could we push back the meeting to 3 PM?",
      },
    };

    it("validates a conforming Listen & Choose question", () => {
      const res = validateQuestion(validListenChoose);
      expect(res.success).toBe(true);
    });

    it("STRICT SECURITY INVARIANT: rejects question when transcript is leaked in public_payload", () => {
      const leakedQuestion = {
        ...validListenChoose,
        public_payload: {
          ...validListenChoose.public_payload,
          transcript: "Could we push back the meeting to 3 PM?",
        },
      };
      const res = validateQuestion(leakedQuestion);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.errors.some((e) => e.includes("BẢO MẬT"))).toBe(true);
      }
    });
  });

  describe("Roleplay Simulator Schema", () => {
    const validRoleplay = {
      game_type: "roleplay",
      topic_id: TEST_TOPIC_ID,
      difficulty: "B1",
      skill: "speaking",
      prompt: "Xử lý tình huống đối tác yêu cầu giao hàng sớm hơn thỏa thuận.",
      explanation_vi: "Cần phản hồi lịch sự, giải thích khả năng thực tế và đưa ra phương án khả thi thay vì từ chối thẳng thừng.",
      concept_tags: ["customer-service", "negotiation"],
      status: "published",
      public_payload: {
        situation: "Khách hàng gửi tin nhắn yêu cầu nhận báo cáo trước 1 ngày so với deadline.",
        npcRole: "Đối tác / Khách hàng",
        npcText: "We need the quarterly audit report by tomorrow morning instead of Friday. Can you send it over?",
        choices: [
          {
            id: "c1",
            text: "I understand the urgency. We can send a preliminary draft by tomorrow morning and the full report on Friday.",
            nextNodeId: "node-2",
          },
          {
            id: "c2",
            text: "No way. Our agreement was Friday, so you will get it on Friday.",
            nextNodeId: "node-3",
          },
        ],
        isTerminal: false,
      },
      private_solution: {
        evaluations: [
          {
            choiceId: "c1",
            rating: "appropriate",
            scoreDelta: 10,
            feedbackVi: "Rất chuyên nghiệp và thấu hiểu nhu cầu của khách hàng trong khi vẫn đảm bảo chất lượng.",
          },
          {
            choiceId: "c2",
            rating: "inappropriate",
            scoreDelta: 0,
            feedbackVi: "Quá thô lỗ và cứng nhắc, dễ làm hỏng mối quan hệ với đối tác.",
          },
        ],
      },
    };

    it("validates a conforming Roleplay question", () => {
      const res = validateQuestion(validRoleplay);
      expect(res.success).toBe(true);
    });

    it("rejects Roleplay question when a choice lacks an evaluation in private_solution", () => {
      const invalid = {
        ...validRoleplay,
        private_solution: {
          evaluations: [validRoleplay.private_solution.evaluations[0]], // missing c2
        },
      };
      const res = validateQuestion(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.errors.some((e) => e.includes("phải có đánh giá tương ứng"))).toBe(true);
      }
    });
  });

  describe("Seed Batch Validator", () => {
    it("reports 100% valid when all questions in batch conform", () => {
      const batch = [
        {
          game_type: "sentence-builder",
          topic_id: TEST_TOPIC_ID,
          difficulty: "A1",
          skill: "grammar",
          prompt: "Sắp xếp câu:",
          explanation_vi: "Cấu trúc câu mệnh lệnh bắt đầu bằng Please.",
          concept_tags: ["office"],
          public_payload: {
            promptVi: "Vui lòng gửi email.",
            tokens: [
              { id: "1", text: "Please" },
              { id: "2", text: "send" },
              { id: "3", text: "the email." },
            ],
          },
          private_solution: {
            canonicalSequence: ["1", "2", "3"],
            canonicalSentence: "Please send the email.",
          },
        },
      ];

      const report = validateSeedBatch(batch);
      expect(report.isValid).toBe(true);
      expect(report.validCount).toBe(1);
      expect(report.invalidCount).toBe(0);
      expect(report.gameTypeBreakdown["sentence-builder"]).toBe(1);
    });

    it("identifies invalid entries with exact index and issues", () => {
      const batch = [
        { invalid: "data" },
      ];

      const report = validateSeedBatch(batch);
      expect(report.isValid).toBe(false);
      expect(report.invalidCount).toBe(1);
      expect(report.errors[0]?.index).toBe(0);
    });
  });
});

