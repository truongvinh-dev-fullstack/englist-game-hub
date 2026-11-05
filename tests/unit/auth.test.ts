import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  emailLoginSchema,
  verifyOtpSchema,
  signUpSchema,
  signInPasswordSchema,
} from "@/lib/validations/auth";
import {
  getGuestProgress,
  recordGuestAnswer,
  clearGuestProgress,
} from "@/lib/storage/guest-storage";

describe("Auth & Guest Boundaries (T-004)", () => {
  describe("Zod Validation — Sign Up Schema", () => {
    it("accepts valid registration data with email, password and full name", () => {
      const result = signUpSchema.safeParse({
        fullName: "Nguyễn Văn A",
        email: "learner@example.com",
        password: "securepassword123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("learner@example.com");
        expect(result.data.fullName).toBe("Nguyễn Văn A");
      }
    });

    it("accepts valid registration data without full name", () => {
      const result = signUpSchema.safeParse({
        email: "user@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects password shorter than 6 characters", () => {
      const result = signUpSchema.safeParse({
        email: "user@example.com",
        password: "123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("tối thiểu 6 ký tự");
      }
    });

    it("rejects invalid email for sign up", () => {
      const result = signUpSchema.safeParse({
        email: "invalid-email",
        password: "validpassword123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Zod Validation — Sign In with Password Schema", () => {
    it("accepts valid credentials", () => {
      const result = signInPasswordSchema.safeParse({
        email: "user@example.com",
        password: "secretpassword",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty password", () => {
      const result = signInPasswordSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });
  describe("Zod Validation — Email Login Schema", () => {
    it("accepts valid email addresses and trims whitespace", () => {
      const result = emailLoginSchema.safeParse({ email: "  learner@company.com  " });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("learner@company.com");
      }
    });

    it("rejects invalid email formats", () => {
      const invalidCases = ["not-an-email", "@missing-user.com", "user@", "", "   "];
      invalidCases.forEach((invalidEmail) => {
        const result = emailLoginSchema.safeParse({ email: invalidEmail });
        expect(result.success).toBe(false);
      });
    });

    it("rejects excessively long email addresses", () => {
      const longEmail = "a".repeat(250) + "@example.com";
      const result = emailLoginSchema.safeParse({ email: longEmail });
      expect(result.success).toBe(false);
    });
  });

  describe("Zod Validation — OTP Schema", () => {
    it("accepts valid 6-digit OTP token", () => {
      const result = verifyOtpSchema.safeParse({
        email: "user@example.com",
        token: "123456",
      });
      expect(result.success).toBe(true);
    });

    it("rejects OTP token shorter than 6 characters", () => {
      const result = verifyOtpSchema.safeParse({
        email: "user@example.com",
        token: "123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Guest Local Storage Isolation", () => {
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
    });

    it("returns default local progress with isLocal flag set to true", () => {
      const progress = getGuestProgress();
      expect(progress.isLocal).toBe(true);
      expect(progress.totalAnswered).toBe(0);
      expect(progress.correctCount).toBe(0);
      expect(progress.wrongQuestionIds).toEqual([]);
    });

    it("records guest answers and tracks wrong question IDs without duplicates", () => {
      // Wrong answer on q-1
      const p1 = recordGuestAnswer("q-1", false);
      expect(p1.totalAnswered).toBe(1);
      expect(p1.correctCount).toBe(0);
      expect(p1.wrongQuestionIds).toContain("q-1");

      // Another wrong answer on q-1 shouldn't duplicate id
      const p2 = recordGuestAnswer("q-1", false);
      expect(p2.totalAnswered).toBe(2);
      expect(p2.wrongQuestionIds).toEqual(["q-1"]);

      // Wrong answer on q-2
      const p3 = recordGuestAnswer("q-2", false);
      expect(p3.totalAnswered).toBe(3);
      expect(p3.wrongQuestionIds).toEqual(["q-1", "q-2"]);

      // Correct answer on q-1 removes it from wrongQuestionIds
      const p4 = recordGuestAnswer("q-1", true);
      expect(p4.totalAnswered).toBe(4);
      expect(p4.correctCount).toBe(1);
      expect(p4.wrongQuestionIds).toEqual(["q-2"]);
    });

    it("clears guest progress properly", () => {
      recordGuestAnswer("q-1", false);
      clearGuestProgress();
      const progress = getGuestProgress();
      expect(progress.totalAnswered).toBe(0);
      expect(progress.wrongQuestionIds).toEqual([]);
    });

    it("handles SSR environment (window undefined) safely without throwing", () => {
      vi.unstubAllGlobals();
      const progress = getGuestProgress();
      expect(progress.isLocal).toBe(true);
      expect(progress.totalAnswered).toBe(0);
    });
  });

  describe("Open Redirect Prevention", () => {
    function sanitizeRedirect(nextParam: string | null): string {
      const next = nextParam ?? "/";
      const isSafeRedirect =
        next.startsWith("/") && !next.startsWith("//") && !next.includes("://");
      return isSafeRedirect ? next : "/";
    }

    it("allows valid relative redirection paths", () => {
      expect(sanitizeRedirect("/profile")).toBe("/profile");
      expect(sanitizeRedirect("/games/sentence-builder")).toBe("/games/sentence-builder");
      expect(sanitizeRedirect("/")).toBe("/");
    });

    it("rejects external or malicious redirect targets and falls back to /", () => {
      expect(sanitizeRedirect("https://malicious-phishing.com")).toBe("/");
      expect(sanitizeRedirect("http://evil.com")).toBe("/");
      expect(sanitizeRedirect("//evil.com")).toBe("/");
      expect(sanitizeRedirect("javascript:alert(1)")).toBe("/");
      expect(sanitizeRedirect(null)).toBe("/");
    });
  });
});

