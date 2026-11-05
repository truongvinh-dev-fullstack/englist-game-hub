import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GameHeader } from "@/components/game-shared/GameHeader";
import { ExitConfirmDialog } from "@/components/game-shared/ExitConfirmDialog";
import { QuestionPrompt } from "@/components/game-shared/QuestionPrompt";
import { FeedbackPanel } from "@/components/game-shared/FeedbackPanel";
import { ResultSummary } from "@/components/game-shared/ResultSummary";

describe("Shared Game UI & Result Screen (T-007)", () => {
  describe("GameHeader Component", () => {
    it("renders progress counter and session XP", () => {
      const html = renderToStaticMarkup(
        <GameHeader current={3} total={10} sessionXp={20} onExit={() => {}} />
      );

      expect(html).toContain("Câu 3 / 10");
      expect(html).toContain("20 XP");
      expect(html).toContain('aria-label="Thoát phiên chơi"');
    });
  });

  describe("ExitConfirmDialog Component", () => {
    it("renders modal dialog with accessible role and descriptions when open", () => {
      const html = renderToStaticMarkup(
        <ExitConfirmDialog isOpen={true} onCancel={() => {}} onConfirm={() => {}} />
      );

      expect(html).toContain('role="alertdialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain("Dừng lượt chơi hiện tại?");
      expect(html).toContain("Tiếp tục chơi");
      expect(html).toContain("Xác nhận thoát");
    });

    it("renders nothing when isOpen is false", () => {
      const html = renderToStaticMarkup(
        <ExitConfirmDialog isOpen={false} onCancel={() => {}} onConfirm={() => {}} />
      );
      expect(html).toBe("");
    });
  });

  describe("QuestionPrompt Component", () => {
    it("renders prompt text, subPrompt, difficulty and tags", () => {
      const html = renderToStaticMarkup(
        <QuestionPrompt
          prompt="Sắp xếp câu hoàn chỉnh"
          subPrompt="Gợi ý nghĩa tiếng Việt"
          difficulty="A2"
          skill="Ngữ pháp"
          conceptTags={["present-tense", "work"]}
        />
      );

      expect(html).toContain("Sắp xếp câu hoàn chỉnh");
      expect(html).toContain("Gợi ý nghĩa tiếng Việt");
      expect(html).toContain("A2");
      expect(html).toContain("Ngữ pháp");
      expect(html).toContain("#present-tense");
      expect(html).toContain("#work");
    });
  });

  describe("FeedbackPanel Component", () => {
    it("renders correct state with +XP and explanation", () => {
      const html = renderToStaticMarkup(
        <FeedbackPanel
          isOpen={true}
          isCorrect={true}
          scoreDelta={10}
          explanation="Câu hoàn chỉnh đúng cấu trúc ngữ pháp."
          onNext={() => {}}
        />
      );

      expect(html).toContain("Chính xác! +10 XP");
      expect(html).toContain("Câu hoàn chỉnh đúng cấu trúc ngữ pháp.");
      expect(html).toContain("Câu tiếp theo");
      expect(html).toContain('aria-live="polite"');
    });

    it("renders incorrect state with revealed correct answer", () => {
      const html = renderToStaticMarkup(
        <FeedbackPanel
          isOpen={true}
          isCorrect={false}
          scoreDelta={0}
          explanation="Cần chia động từ số ít."
          correctAnswerText="She wants"
          isLastQuestion={true}
          onNext={() => {}}
        />
      );

      expect(html).toContain("Chưa chính xác!");
      expect(html).toContain("Cần chia động từ số ít.");
      expect(html).toContain("She wants");
      expect(html).toContain("Xem kết quả");
    });

    it("returns null when isOpen is false", () => {
      const html = renderToStaticMarkup(
        <FeedbackPanel
          isOpen={false}
          isCorrect={true}
          explanation="Test"
          onNext={() => {}}
        />
      );
      expect(html).toBe("");
    });
  });

  describe("ResultSummary Component", () => {
    it("renders complete summary statistics and notices", () => {
      const html = renderToStaticMarkup(
        <ResultSummary
          gameTitle="Sentence Builder"
          gameSlug="sentence-builder"
          totalQuestions={10}
          correctCount={8}
          totalXp={80}
          accuracyPercentage={80}
          wrongCount={2}
          isGuest={true}
        />
      );

      expect(html).toContain("Sentence Builder");
      expect(html).toContain("Xuất sắc!");
      expect(html).toContain("80%");
      expect(html).toContain("8 / 10");
      expect(html).toContain("80 XP");
      expect(html).toContain("Chế độ khách");
      expect(html).toContain("Ôn lại các câu sai (2)");
      expect(html).toContain("Chơi lại lượt khác");
    });
  });
});
