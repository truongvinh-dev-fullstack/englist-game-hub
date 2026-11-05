import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  parseCsvLine,
  parseQuestionsCsv,
  getSampleCsvTemplate,
} from "@/lib/services/csv-importer.service";
import AdminDashboardPage from "@/app/admin/page";
import AdminQuestionsPage from "@/app/admin/questions/page";
import AdminTopicsPage from "@/app/admin/topics/page";
import AdminImportPage from "@/app/admin/import/page";

describe("Admin CRUD & CSV Import (T-016)", () => {
  describe("RBAC & Access Control Logic", () => {
    const evaluateAdminAccess = (user: { id: string; role?: string } | null) => {
      if (!user) return { allowed: false, redirect: "/login" };
      if (user.role !== "admin") return { allowed: false, redirect: "/" };
      return { allowed: true, redirect: null };
    };

    it("redirects unauthenticated guest to login", () => {
      const access = evaluateAdminAccess(null);
      expect(access.allowed).toBe(false);
      expect(access.redirect).toBe("/login");
    });

    it("forbids non-admin authenticated users and redirects to home", () => {
      const learnerUser = { id: "user-1", role: "learner" };
      const access = evaluateAdminAccess(learnerUser);
      expect(access.allowed).toBe(false);
      expect(access.redirect).toBe("/");
    });

    it("allows authorized admin users to access admin portal", () => {
      const adminUser = { id: "admin-1", role: "admin" };
      const access = evaluateAdminAccess(adminUser);
      expect(access.allowed).toBe(true);
      expect(access.redirect).toBeNull();
    });
  });

  describe("CSV Line Parser (parseCsvLine)", () => {
    it("parses simple comma-separated fields", () => {
      const line = "memory-flip,A1,vocabulary";
      expect(parseCsvLine(line)).toEqual(["memory-flip", "A1", "vocabulary"]);
    });

    it("correctly handles quoted fields containing commas", () => {
      const line = `memory-flip,"Lật thẻ ghép từ: bàn, ghế",A1`;
      expect(parseCsvLine(line)).toEqual([
        "memory-flip",
        "Lật thẻ ghép từ: bàn, ghế",
        "A1",
      ]);
    });

    it("correctly unescapes double quotes inside quoted fields", () => {
      const line = `sentence-builder,"{""word"":""Laptop""}"`;
      expect(parseCsvLine(line)).toEqual(["sentence-builder", `{"word":"Laptop"}`]);
    });
  });

  describe("CSV Importer & Zod Validation Engine (parseQuestionsCsv)", () => {
    it("successfully parses sample CSV template with 100% valid questions", () => {
      const sampleCsv = getSampleCsvTemplate();
      const result = parseQuestionsCsv(sampleCsv);

      expect(result.totalRows).toBe(5);
      expect(result.validCount).toBe(5);
      expect(result.errorCount).toBe(0);
      expect(result.errors).toEqual([]);
      const gameTypes = result.validQuestions.map((q) => q.game_type);
      expect(gameTypes).toEqual([
        "memory-flip",
        "sentence-builder",
        "error-detective",
        "listen-choose",
        "roleplay",
      ]);
    });

    it("rejects CSV with missing required header columns", () => {
      const malformedHeader = "invalid_col1,invalid_col2\nrow1,row2";
      const result = parseQuestionsCsv(malformedHeader);

      expect(result.validCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].error).toContain("Tiêu đề CSV không đúng định dạng");
    });

    it("reports line number and error when JSON payload is corrupted", () => {
      const corruptedJsonCsv = [
        "game_type,topic_id,difficulty,skill,prompt,explanation_vi,concept_tags,public_payload_json,private_solution_json,status",
        `memory-flip,00000000-0000-0000-0000-000000000001,A1,vocabulary,"Prompt",Explanation,tag,"INVALID_NOT_A_JSON","{}",draft`,
      ].join("\n");

      const result = parseQuestionsCsv(corruptedJsonCsv);
      expect(result.validCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].line).toBe(2);
      expect(result.errors[0].error).toContain("public_payload_json không phải là chuỗi JSON hợp lệ");
    });

    it("enforces Zero-Leakage security by rejecting listen-choose with transcript in public_payload", () => {
      const leakedCsv = [
        "game_type,topic_id,difficulty,skill,prompt,explanation_vi,concept_tags,public_payload_json,private_solution_json,status",
        `listen-choose,00000000-0000-0000-0000-000000000001,A1,listening,"Nghe và chọn",Explanation,tag,"{""audioPath"":""/audio.mp3"",""transcript"":""LEAKED"",""options"":[{""id"":""o1"",""text"":""Option 1""},{""id"":""o2"",""text"":""Option 2""}]}","{""correctOptionId"":""o1"",""transcriptEn"":""Valid transcript""}",published`,
      ].join("\n");

      const result = parseQuestionsCsv(leakedCsv);
      expect(result.validCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].error).toContain("BẢO MẬT: Không được nhúng transcript");
    });
  });

  describe("Admin Pages UI Rendering", () => {
    it("renders Admin Dashboard with metrics and quick links", () => {
      const html = renderToStaticMarkup(<AdminDashboardPage />);

      expect(html).toContain("Bảng điều khiển Quản trị viên");
      expect(html).toContain("Tổng số câu hỏi");
      expect(html).toContain("Đã xuất bản (Live)");
      expect(html).toContain("Chủ đề công sở");
      expect(html).toContain("Quản lý danh sách câu hỏi");
      expect(html).toContain("Nhập dữ liệu từ file CSV");
    });

    it("renders Admin Questions Page with table and filter toolbar", () => {
      const html = renderToStaticMarkup(<AdminQuestionsPage />);

      expect(html).toContain("Quản lý danh sách câu hỏi");
      expect(html).toContain("Tất cả loại trò chơi");
      expect(html).toContain("Tất cả trạng thái");
      expect(html).toContain("memory-flip");
      expect(html).toContain("Xuất bản");
    });

    it("renders Admin Topics Page with workplace topics listing", () => {
      const html = renderToStaticMarkup(<AdminTopicsPage />);

      expect(html).toContain("Quản lý danh mục chủ đề");
      expect(html).toContain("Thiết bị &amp; Văn phòng cơ bản");
      expect(html).toContain("Thêm chủ đề mới");
    });

    it("renders Admin Excel & Game-Specific Import Page with tabs and upload controls", () => {
      const html = renderToStaticMarkup(<AdminImportPage />);

      expect(html).toContain("Nhập dữ liệu câu hỏi từ file Excel (.xlsx)");
      expect(html).toContain("Sentence Builder");
      expect(html).toContain("Memory Flip");
      expect(html).toContain("Error Detective");
      expect(html).toContain("Listen &amp; Choose");
      expect(html).toContain("Roleplay Simulator");
      expect(html).toContain("Tải file Excel mẫu (.xlsx)");
      expect(html).toContain("Xem thử dữ liệu mẫu");
      expect(html).toContain("Bấm để chọn tệp hoặc kéo thả file Excel vào đây");
    });
  });
});
