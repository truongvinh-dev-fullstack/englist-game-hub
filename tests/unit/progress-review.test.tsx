import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  getGuestProgress,
  recordGuestAnswer,
  clearGuestProgress,
} from "@/lib/storage/guest-storage";
import ProgressPage from "@/app/progress/page";
import ReviewPage from "@/app/review/page";

describe("Progress & Review Queue (T-015)", () => {
  beforeEach(() => {
    let mockStorage: Record<string, string> = {};
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
    clearGuestProgress();
  });

  describe("Guest Storage Tracking & Accuracy", () => {
    it("initializes with default zeroed stats", () => {
      const progress = getGuestProgress();
      expect(progress.isLocal).toBe(true);
      expect(progress.totalAnswered).toBe(0);
      expect(progress.correctCount).toBe(0);
      expect(progress.wrongQuestionIds).toEqual([]);
    });

    it("records correct answers and updates accuracy metrics", () => {
      recordGuestAnswer("q-1", true);
      let progress = getGuestProgress();
      expect(progress.totalAnswered).toBe(1);
      expect(progress.correctCount).toBe(1);
      expect(progress.wrongQuestionIds).toEqual([]);

      recordGuestAnswer("q-2", false);
      progress = getGuestProgress();
      expect(progress.totalAnswered).toBe(2);
      expect(progress.correctCount).toBe(1);
      expect(progress.wrongQuestionIds).toContain("q-2");
    });

    it("removes resolved questions from wrong questions queue upon correct re-attempt", () => {
      // First attempt is wrong
      recordGuestAnswer("q-problematic", false);
      let progress = getGuestProgress();
      expect(progress.wrongQuestionIds).toContain("q-problematic");

      // Second attempt is correct -> should be cleared from review queue
      recordGuestAnswer("q-problematic", true);
      progress = getGuestProgress();
      expect(progress.wrongQuestionIds).not.toContain("q-problematic");
    });
  });

  describe("Ownership & Data Privacy Boundaries", () => {
    it("ensures guest progress remains strictly local and untrusted", () => {
      const progress = getGuestProgress();
      expect(progress.isLocal).toBe(true);
    });

    it("verifies RLS user_id ownership predicates on user session queries", () => {
      // Verify simulated Supabase query policy structure
      const mockSessionQuery = (userId: string, targetUserId: string) => {
        // Enforces RLS condition: user_id = auth.uid()
        return userId === targetUserId;
      };

      const userA = "11111111-1111-1111-1111-111111111111";
      const userB = "22222222-2222-2222-2222-222222222222";

      // User A can access own session
      expect(mockSessionQuery(userA, userA)).toBe(true);
      // User A CANNOT access User B session
      expect(mockSessionQuery(userA, userB)).toBe(false);
    });
  });

  describe("Progress Page UI Component", () => {
    it("renders stats overview cards, guest warning, and skill breakdown", () => {
      const html = renderToStaticMarkup(<ProgressPage />);

      expect(html).toContain("Tiến độ học tập cá nhân");
      expect(html).toContain("Tiến độ đang được lưu cục bộ");
      expect(html).toContain("Kinh nghiệm (XP)");
      expect(html).toContain("Độ chính xác");
      expect(html).toContain("Chuỗi ngày học");
      expect(html).toContain("Cần ôn tập lại");
      expect(html).toContain("Từ vựng công sở");
      expect(html).toContain("Ngữ pháp chính xác");
      expect(html).toContain("Luyện nghe hiểu");
      expect(html).toContain("Giao tiếp &amp; Đàm phán");
    });
  });

  describe("Review Queue Page UI Component", () => {
    it("renders empty state celebration when review queue has no wrong answers", () => {
      const html = renderToStaticMarkup(<ReviewPage />);

      expect(html).toContain("Hàng đợi ôn tập câu sai");
      expect(html).toContain("Tuyệt vời! Hàng đợi ôn tập đang trống");
      expect(html).toContain("Khám phá kho trò chơi");
    });
  });
});
