import { describe, it, expect } from "vitest";
import {
  exportGameExcelTemplate,
  parseGameExcelOrCsv,
  getGameExcelTemplateDefinition,
  type SupportedGameType,
} from "@/lib/services/excel-game-importer.service";

describe("Excel Game Importer Service", () => {
  const games: SupportedGameType[] = [
    "sentence-builder",
    "memory-flip",
    "error-detective",
    "listen-choose",
    "roleplay",
  ];

  games.forEach((gameType) => {
    describe(`Game Template & Import: ${gameType}`, () => {
      it(`exports a valid Excel template with headers and sample rows for ${gameType}`, () => {
        const def = getGameExcelTemplateDefinition(gameType);
        expect(def.headers.length).toBeGreaterThan(3);
        expect(def.sampleRows.length).toBeGreaterThan(0);

        const excelBuffer = exportGameExcelTemplate(gameType);
        expect(excelBuffer).toBeInstanceOf(Uint8Array);
        expect(excelBuffer.length).toBeGreaterThan(100);
      });

      it(`correctly parses and validates the generated Excel template for ${gameType}`, () => {
        const excelBuffer = exportGameExcelTemplate(gameType);
        const result = parseGameExcelOrCsv(excelBuffer, gameType);

        expect(result.gameType).toBe(gameType);
        expect(result.totalRows).toBeGreaterThan(0);
        if (gameType === "memory-flip") {
          expect(result.validCount).toBe(result.totalRows / 4);
        } else {
          expect(result.validCount).toBe(result.totalRows);
        }
        expect(result.errorCount).toBe(0);
        expect(result.errors).toEqual([]);

        // Ensure each question has proper game_type
        result.validQuestions.forEach((q) => {
          expect(q.game_type).toBe(gameType);
          expect(q.status).toBe("published");
          expect(q.explanation_vi.length).toBeGreaterThan(5);
        });
      });
    });
  });

  it("handles empty Excel buffer gracefully", () => {
    // Generate an empty workbook
    import("xlsx").then((XLSX) => {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([]);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      const result = parseGameExcelOrCsv(new Uint8Array(buffer), "sentence-builder");
      expect(result.validCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].error).toContain("trống");
    });
  });

  describe("Memory Flip Vertical Vocabulary List Auto-Chunking", () => {
    it("chunks 12 vocabulary rows into 3 complete 4-pair game boards", async () => {
      const XLSX = await import("xlsx");
      const headers = ["Từ tiếng Anh (EN)", "Nghĩa tiếng Việt (VI)", "Độ khó (A1/A2)", "Từ khóa / Chủ đề"];
      const rows = [
        ["Word 1", "Từ 1", "A1", "test"],
        ["Word 2", "Từ 2", "A1", "test"],
        ["Word 3", "Từ 3", "A1", "test"],
        ["Word 4", "Từ 4", "A1", "test"],
        ["Word 5", "Từ 5", "A1", "test"],
        ["Word 6", "Từ 6", "A1", "test"],
        ["Word 7", "Từ 7", "A1", "test"],
        ["Word 8", "Từ 8", "A1", "test"],
        ["Word 9", "Từ 9", "A1", "test"],
        ["Word 10", "Từ 10", "A1", "test"],
        ["Word 11", "Từ 11", "A1", "test"],
        ["Word 12", "Từ 12", "A1", "test"],
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      const result = parseGameExcelOrCsv(new Uint8Array(buffer), "memory-flip");
      expect(result.totalRows).toBe(12);
      expect(result.validCount).toBe(3);
      expect(result.errorCount).toBe(0);
      expect(result.validQuestions.length).toBe(3);
      result.validQuestions.forEach((q) => {
        expect(q.game_type).toBe("memory-flip");
        if (q.game_type === "memory-flip") {
          expect(q.public_payload.cards.length).toBe(8);
          expect(q.private_solution.pairs.length).toBe(4);
        }
      });
    });

    it("reports leftover rows if total vocabulary count is not a multiple of 4", async () => {
      const XLSX = await import("xlsx");
      const headers = ["Từ tiếng Anh (EN)", "Nghĩa tiếng Việt (VI)", "Độ khó (A1/A2)"];
      const rows = [
        ["W1", "T1", "A1"],
        ["W2", "T2", "A1"],
        ["W3", "T3", "A1"],
        ["W4", "T4", "A1"],
        ["W5", "T5", "A1"],
        ["W6", "T6", "A1"],
      ]; // 6 rows: 1 board of 4, and 2 leftover rows
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      const result = parseGameExcelOrCsv(new Uint8Array(buffer), "memory-flip");
      expect(result.validCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].error).toContain("không đủ 4 cặp");
    });
  });

  describe("Sentence Builder Flexible Headers & Single Word Guard", () => {
    it("accepts 'Từ tiếng Anh (EN)' and 'Nghĩa tiếng Việt (VI)' headers for Sentence Builder", async () => {
      const XLSX = await import("xlsx");
      const headers = ["Từ tiếng Anh (EN)", "Nghĩa tiếng Việt (VI)", "Độ khó (A1/A2)", "Từ khóa / Chủ đề"];
      const rows = [
        ["Please check the email.", "Vui lòng kiểm tra email.", "A1", "office;business"],
        ["Can you send me the email?", "Bạn có thể gửi cho tôi email không?", "A1", "office;business"],
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      const result = parseGameExcelOrCsv(new Uint8Array(buffer), "sentence-builder");
      expect(result.validCount).toBe(2);
      expect(result.errorCount).toBe(0);
      expect(result.validQuestions[0].game_type).toBe("sentence-builder");
    });

    it("gives a friendly warning when a single word is uploaded to Sentence Builder", async () => {
      const XLSX = await import("xlsx");
      const headers = ["Từ tiếng Anh (EN)", "Nghĩa tiếng Việt (VI)", "Độ khó (A1/A2)"];
      const rows = [
        ["Email", "email", "A1"],
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      const result = parseGameExcelOrCsv(new Uint8Array(buffer), "sentence-builder");
      expect(result.validCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].error).toContain("chỉ có 1 từ");
      expect(result.errors[0].error).toContain("Memory Flip");
    });
  });

  describe("Listen & Choose TTS Importer Without Audio Files", () => {
    it("successfully imports Listen & Choose with English speech text and letter answers (A/B/C/D)", async () => {
      const XLSX = await import("xlsx");
      const headers = [
        "Độ khó (A1/A2)",
        "Câu thoại tiếng Anh (đọc bằng máy)",
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4",
        "Đáp án đúng (1, 2, 3, 4 hoặc A, B, C, D)",
        "Giải thích tiếng Việt",
        "Từ khóa",
      ];
      const rows = [
        [
          "A1",
          "Could you send me the invoice by 3 PM?",
          "Gửi hóa đơn trước 3 giờ chiều",
          "In hợp đồng trước 3 giờ chiều",
          "Gọi lại lúc 3 giờ chiều",
          "Hủy hóa đơn chiều nay",
          "A",
          "Đoạn thoại yêu cầu gửi hóa đơn (invoice) trước 3 giờ chiều (3 PM).",
          "office;invoice",
        ],
        [
          "A2",
          "The flight to Tokyo has been delayed by two hours.",
          "Chuyến bay đúng giờ",
          "Chuyến bay bị hoãn 2 tiếng",
          "Chuyến bay bị hủy",
          "Chuyến bay đổi cổng",
          "2",
          "Đoạn thoại thông báo delayed by two hours (hoãn 2 tiếng).",
          "travel;airport",
        ],
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      const result = parseGameExcelOrCsv(new Uint8Array(buffer), "listen-choose");
      expect(result.totalRows).toBe(2);
      expect(result.validCount).toBe(2);
      expect(result.errorCount).toBe(0);
      expect(result.errors).toEqual([]);

      const q1 = result.validQuestions[0];
      expect(q1.game_type).toBe("listen-choose");
      if (q1.game_type === "listen-choose") {
        expect(q1.public_payload.audioPath).toBe("tts");
        expect(q1.public_payload.speechText).toBe("Could you send me the invoice by 3 PM?");
        expect(q1.public_payload.options.length).toBe(4);
        expect(q1.private_solution.correctOptionId).toBe("opt1");
        expect(q1.private_solution.transcriptEn).toBe("Could you send me the invoice by 3 PM?");
      }

      const q2 = result.validQuestions[1];
      if (q2.game_type === "listen-choose") {
        expect(q2.public_payload.audioPath).toBe("tts");
        expect(q2.public_payload.speechText).toBe("The flight to Tokyo has been delayed by two hours.");
        expect(q2.private_solution.correctOptionId).toBe("opt2");
      }
    });

    it("parses UTF-8 CSV with Vietnamese headers and diacritics without mojibake", () => {
      const csvData = [
        `Độ khó (A1/A2),Câu thoại tiếng Anh (đọc bằng máy),Lựa chọn 1,Lựa chọn 2,Lựa chọn 3,Lựa chọn 4,"Đáp án đúng (1, 2, 3, 4 hoặc A, B, C, D)",Giải thích tiếng Việt,Từ khóa`,
        `A1,I need to check the weekly report.,Tôi cần trả lời email nhà cung cấp.,Tôi cần hủy đặt chỗ.,Tôi cần nhận hàng giao.,Tôi cần kiểm tra báo cáo tuần.,D,Nghe cụm “check the weekly report” nghĩa là “kiểm tra báo cáo tuần”.,listening;workplace;check`,
      ].join("\n");

      const encoder = new TextEncoder();
      const csvBuffer = encoder.encode(csvData);

      const result = parseGameExcelOrCsv(csvBuffer, "listen-choose");
      expect(result.validCount).toBe(1);
      expect(result.errorCount).toBe(0);
      expect(result.errors).toEqual([]);

      const q = result.validQuestions[0];
      if (q.game_type === "listen-choose") {
        expect(q.public_payload.speechText).toBe("I need to check the weekly report.");
        expect(q.private_solution.transcriptEn).toBe("I need to check the weekly report.");
        expect(q.public_payload.options[3].text).toBe("Tôi cần kiểm tra báo cáo tuần.");
        expect(q.private_solution.correctOptionId).toBe("opt4");
      }
    });
  });
});
