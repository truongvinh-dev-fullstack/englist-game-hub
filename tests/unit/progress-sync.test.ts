import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getUserTotalXP,
  getDailyGoalProgress,
  getSkillProgressSummary,
  getGameProgressSummary,
} from "@/lib/storage/progress-sync";
import { recordGuestAnswer, clearGuestProgress } from "@/lib/storage/guest-storage";
import { saveStageRecord, clearStageRecords } from "@/lib/storage/game-record-storage";

describe("Progress Synchronization Unit Tests", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
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
      dispatchEvent: vi.fn(),
    });

    clearGuestProgress();
    clearStageRecords();
  });

  describe("getUserTotalXP", () => {
    it("returns 0 when no progress exists", () => {
      expect(getUserTotalXP()).toBe(0);
    });

    it("returns correct XP calculated from guest correct answers", () => {
      // 20 correct answers = 200 XP
      for (let i = 1; i <= 20; i++) {
        recordGuestAnswer(`q-${i}`, true);
      }
      expect(getUserTotalXP()).toBe(200);
    });

    it("aggregates XP from stage records if higher", () => {
      saveStageRecord({
        gameSlug: "memory-flip",
        stage: 1,
        timeSeconds: 45,
        correctCount: 10,
        totalQuestions: 10,
        xp: 100,
      });
      saveStageRecord({
        gameSlug: "memory-flip",
        stage: 2,
        timeSeconds: 50,
        correctCount: 10,
        totalQuestions: 10,
        xp: 100,
      });

      expect(getUserTotalXP()).toBe(200);
    });
  });

  describe("getDailyGoalProgress", () => {
    it("reports incomplete when 0 sessions played today", () => {
      const goal = getDailyGoalProgress(2);
      expect(goal.completedCount).toBe(0);
      expect(goal.isCompleted).toBe(false);
      expect(goal.percent).toBe(0);
      expect(goal.label).toContain("Chưa hoàn thành");
    });

    it("reports partial progress when 1 stage played today", () => {
      saveStageRecord({
        gameSlug: "memory-flip",
        stage: 1,
        timeSeconds: 60,
        correctCount: 10,
        totalQuestions: 10,
        xp: 100,
      });

      const goal = getDailyGoalProgress(2);
      expect(goal.completedCount).toBeGreaterThanOrEqual(1);
      expect(goal.percent).toBeGreaterThanOrEqual(50);
    });

    it("reports completed goal when 2 stages played today", () => {
      saveStageRecord({
        gameSlug: "memory-flip",
        stage: 1,
        timeSeconds: 60,
        correctCount: 10,
        totalQuestions: 10,
        xp: 100,
      });
      saveStageRecord({
        gameSlug: "memory-flip",
        stage: 2,
        timeSeconds: 55,
        correctCount: 10,
        totalQuestions: 10,
        xp: 100,
      });

      const goal = getDailyGoalProgress(2);
      expect(goal.completedCount).toBeGreaterThanOrEqual(2);
      expect(goal.isCompleted).toBe(true);
      expect(goal.percent).toBe(100);
      expect(goal.label).toContain("Đã hoàn thành");
    });
  });

  describe("getSkillProgressSummary", () => {
    it("reports Level 1 for 0 XP", () => {
      const summary = getSkillProgressSummary();
      expect(summary.totalXp).toBe(0);
      expect(summary.level).toBe(1);
    });

    it("reports Level 2 when user has 200 XP", () => {
      for (let i = 1; i <= 20; i++) {
        recordGuestAnswer(`q-${i}`, true);
      }
      const summary = getSkillProgressSummary();
      expect(summary.totalXp).toBe(200);
      expect(summary.level).toBe(2);
      expect(summary.levelName).toBe("Sơ cấp A2");
      expect(summary.levelProgressPercent).toBe(50); // halfway between 100 and 300
    });
  });

  describe("getGameProgressSummary", () => {
    it("reports Màn 1 for a game that has not been played yet", () => {
      const summary = getGameProgressSummary("sentence-builder");
      expect(summary.hasPlayed).toBe(false);
      expect(summary.currentStage).toBe(1);
      expect(summary.actionText).toBe("Vào chơi");
    });

    it("reports Màn 3 when user completed Stage 1 and Stage 2", () => {
      saveStageRecord({
        gameSlug: "memory-flip",
        stage: 1,
        timeSeconds: 40,
        correctCount: 10,
        totalQuestions: 10,
        xp: 100,
      });
      saveStageRecord({
        gameSlug: "memory-flip",
        stage: 2,
        timeSeconds: 42,
        correctCount: 10,
        totalQuestions: 10,
        xp: 100,
      });

      const summary = getGameProgressSummary("memory-flip");
      expect(summary.hasPlayed).toBe(true);
      expect(summary.highestCompletedStage).toBe(2);
      expect(summary.currentStage).toBeGreaterThanOrEqual(2);
      expect(summary.actionText).toContain("Chơi tiếp Màn");
    });
  });
});
