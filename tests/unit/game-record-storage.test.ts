import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  formatDuration,
  formatDurationVi,
  getStageRecord,
  getGameStageRecords,
  saveStageRecord,
  clearStageRecords,
} from "@/lib/storage/game-record-storage";

describe("Game Record Storage & Personal Best (T-019)", () => {
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
    });
    clearStageRecords();
  });

  describe("Duration Formatting", () => {
    it("formats digital time display correctly mm:ss", () => {
      expect(formatDuration(0)).toBe("00:00");
      expect(formatDuration(45)).toBe("00:45");
      expect(formatDuration(65)).toBe("01:05");
      expect(formatDuration(600)).toBe("10:00");
    });

    it("formats Vietnamese friendly time display", () => {
      expect(formatDurationVi(45)).toBe("45 giây");
      expect(formatDurationVi(60)).toBe("1 phút");
      expect(formatDurationVi(95)).toBe("1 phút 35 giây");
    });
  });

  describe("Record Saving and Personal Best Detection", () => {
    it("saves initial stage record as new best time and score", () => {
      const res = saveStageRecord({
        gameSlug: "memory-flip",
        stage: 1,
        topic: "all",
        timeSeconds: 90,
        correctCount: 8,
        totalQuestions: 10,
        xp: 80,
      });

      expect(res.isNewBestTime).toBe(true);
      expect(res.isNewBestScore).toBe(true);
      expect(res.record.bestTimeSeconds).toBe(90);
      expect(res.record.bestCorrectCount).toBe(8);
      expect(res.record.playCount).toBe(1);

      const saved = getStageRecord("memory-flip", 1, "all");
      expect(saved).not.toBeNull();
      expect(saved?.bestTimeSeconds).toBe(90);
    });

    it("detects when player beats their personal best time", () => {
      // First attempt: 90s
      saveStageRecord({
        gameSlug: "memory-flip",
        stage: 1,
        timeSeconds: 90,
        correctCount: 8,
        totalQuestions: 10,
        xp: 80,
      });

      // Second attempt: 65s (Faster!)
      const res = saveStageRecord({
        gameSlug: "memory-flip",
        stage: 1,
        timeSeconds: 65,
        correctCount: 9,
        totalQuestions: 10,
        xp: 90,
      });

      expect(res.isNewBestTime).toBe(true);
      expect(res.isNewBestScore).toBe(true);
      expect(res.record.bestTimeSeconds).toBe(65);
      expect(res.record.lastTimeSeconds).toBe(65);
      expect(res.record.playCount).toBe(2);
    });

    it("does not flag new best time if attempt is slower", () => {
      // First attempt: 60s
      saveStageRecord({
        gameSlug: "memory-flip",
        stage: 1,
        timeSeconds: 60,
        correctCount: 10,
        totalQuestions: 10,
        xp: 100,
      });

      // Second attempt: 80s (Slower)
      const res = saveStageRecord({
        gameSlug: "memory-flip",
        stage: 1,
        timeSeconds: 80,
        correctCount: 10,
        totalQuestions: 10,
        xp: 100,
      });

      expect(res.isNewBestTime).toBe(false);
      expect(res.record.bestTimeSeconds).toBe(60);
      expect(res.record.lastTimeSeconds).toBe(80);
      expect(res.record.playCount).toBe(2);
    });

    it("retrieves stage records indexed by stage number", () => {
      saveStageRecord({
        gameSlug: "memory-flip",
        stage: 1,
        timeSeconds: 50,
        correctCount: 10,
        totalQuestions: 10,
        xp: 100,
      });

      saveStageRecord({
        gameSlug: "memory-flip",
        stage: 2,
        timeSeconds: 70,
        correctCount: 9,
        totalQuestions: 10,
        xp: 90,
      });

      const stages = getGameStageRecords("memory-flip");
      expect(stages[1]).toBeDefined();
      expect(stages[1].bestTimeSeconds).toBe(50);
      expect(stages[2]).toBeDefined();
      expect(stages[2].bestTimeSeconds).toBe(70);
    });
  });
});

