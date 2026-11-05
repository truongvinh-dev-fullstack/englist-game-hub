import { validateQuestion } from "@/lib/validations/content";

export interface ParsedCsvResult {
  totalRows: number;
  validCount: number;
  errorCount: number;
  validQuestions: Array<Record<string, unknown>>;
  errors: Array<{
    line: number;
    error: string;
    rawRow?: string[];
  }>;
}

/**
 * Standard CSV Question Row Header Columns:
 * game_type,topic_id,difficulty,skill,prompt,explanation_vi,concept_tags,public_payload_json,private_solution_json,status
 */
export const CSV_HEADER_COLUMNS = [
  "game_type",
  "topic_id",
  "difficulty",
  "skill",
  "prompt",
  "explanation_vi",
  "concept_tags",
  "public_payload_json",
  "private_solution_json",
  "status",
] as const;

/**
 * Helper to split CSV line safely handling quoted strings with commas and escaped quotes
 */
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuote && line[i + 1] === '"') {
        current += '"';
        i++; // skip next escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === "," && !insideQuote) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Validates and parses question CSV string
 */
export function parseQuestionsCsv(csvContent: string): ParsedCsvResult {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return {
      totalRows: 0,
      validCount: 0,
      errorCount: 0,
      validQuestions: [],
      errors: [{ line: 1, error: "Tệp CSV trống hoặc không có nội dung." }],
    };
  }

  // Parse header
  const headerColumns = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
  const hasGameType = headerColumns.includes("game_type");
  const hasPrompt = headerColumns.includes("prompt");
  const hasPublicPayload = headerColumns.includes("public_payload_json");
  const hasPrivateSolution = headerColumns.includes("private_solution_json");

  if (!hasGameType || !hasPrompt || !hasPublicPayload || !hasPrivateSolution) {
    return {
      totalRows: 0,
      validCount: 0,
      errorCount: 1,
      validQuestions: [],
      errors: [
        {
          line: 1,
          error:
            "Tiêu đề CSV không đúng định dạng. Cần có ít nhất: game_type, topic_id, difficulty, skill, prompt, explanation_vi, concept_tags, public_payload_json, private_solution_json",
        },
      ],
    };
  }

  const validQuestions: Array<Record<string, unknown>> = [];
  const errors: Array<{ line: number; error: string; rawRow?: string[] }> = [];

  for (let i = 1; i < lines.length; i++) {
    const lineNumber = i + 1;
    const row = parseCsvLine(lines[i]);

    if (row.length < headerColumns.length) {
      errors.push({
        line: lineNumber,
        error: `Số lượng cột không khớp (cần ${headerColumns.length} cột, nhận được ${row.length} cột).`,
        rawRow: row,
      });
      continue;
    }

    const rowObj: Record<string, string> = {};
    headerColumns.forEach((header, idx) => {
      rowObj[header] = row[idx] || "";
    });

    try {
      let publicPayload: unknown;
      let privateSolution: unknown;

      try {
        publicPayload = JSON.parse(rowObj.public_payload_json || "{}");
      } catch {
        errors.push({
          line: lineNumber,
          error: "public_payload_json không phải là chuỗi JSON hợp lệ.",
          rawRow: row,
        });
        continue;
      }

      try {
        privateSolution = JSON.parse(rowObj.private_solution_json || "{}");
      } catch {
        errors.push({
          line: lineNumber,
          error: "private_solution_json không phải là chuỗi JSON hợp lệ.",
          rawRow: row,
        });
        continue;
      }

      const conceptTags = (rowObj.concept_tags || "")
        .split(";")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const candidate = {
        game_type: rowObj.game_type,
        topic_id: rowObj.topic_id || "00000000-0000-0000-0000-000000000001",
        difficulty: rowObj.difficulty || "A1",
        skill: rowObj.skill || "vocabulary",
        prompt: rowObj.prompt,
        explanation_vi: rowObj.explanation_vi || "Giải thích mặc định",
        concept_tags: conceptTags.length > 0 ? conceptTags : ["workplace"],
        status: rowObj.status || "draft",
        version: 1,
        public_payload: publicPayload,
        private_solution: privateSolution,
      };

      const validationResult = validateQuestion(candidate);
      if (!validationResult.success) {
        const errorMsg = validationResult.errors && Array.isArray(validationResult.errors)
          ? validationResult.errors.join(", ")
          : "Dữ liệu câu hỏi không hợp lệ theo Zod schema.";

        errors.push({
          line: lineNumber,
          error: errorMsg,
          rawRow: row,
        });
      } else {
        validQuestions.push(candidate);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định khi xử lý dòng.";
      errors.push({
        line: lineNumber,
        error: msg,
        rawRow: row,
      });
    }
  }

  return {
    totalRows: lines.length - 1,
    validCount: validQuestions.length,
    errorCount: errors.length,
    validQuestions,
    errors,
  };
}

/**
 * Generate a sample CSV template for admins to download (includes all 6 mini-games)
 */
export function getSampleCsvTemplate(): string {
  return [
    CSV_HEADER_COLUMNS.join(","),
    `memory-flip,00000000-0000-0000-0000-000000000001,A1,vocabulary,"Lật các thẻ bài để ghép 4 cặp từ vựng công sở thông dụng.","Các cặp từ vựng cốt lõi: Colleague, Deadline, Meeting, Schedule.",office;workflow,"{""pairsCount"":4,""cards"":[{""id"":""c1"",""pairId"":""p1"",""content"":""Colleague"",""type"":""en""},{""id"":""c2"",""pairId"":""p3"",""content"":""Meeting"",""type"":""en""},{""id"":""c3"",""pairId"":""p2"",""content"":""Hạn chót"",""type"":""vi""},{""id"":""c4"",""pairId"":""p4"",""content"":""Lịch trình"",""type"":""vi""},{""id"":""c5"",""pairId"":""p1"",""content"":""Đồng nghiệp"",""type"":""vi""},{""id"":""c6"",""pairId"":""p2"",""content"":""Deadline"",""type"":""en""},{""id"":""c7"",""pairId"":""p4"",""content"":""Schedule"",""type"":""en""},{""id"":""c8"",""pairId"":""p3"",""content"":""Cuộc họp"",""type"":""vi""}]}","{""pairs"":[{""pairId"":""p1"",""en"":""Colleague"",""vi"":""Đồng nghiệp""},{""pairId"":""p2"",""en"":""Deadline"",""vi"":""Hạn chót""},{""pairId"":""p3"",""en"":""Meeting"",""vi"":""Cuộc họp""},{""pairId"":""p4"",""en"":""Schedule"",""vi"":""Lịch trình""}]}",published`,
    `sentence-builder,00000000-0000-0000-0000-000000000001,A1,grammar,"Sắp xếp câu yêu cầu công việc.","Cấu trúc Please + V nguyên mẫu để đưa ra lời đề nghị lịch sự.",requests;office,"{""promptVi"":""Vui lòng gửi cho tôi báo cáo."",""tokens"":[{""id"":""t1"",""text"":""Please""},{""id"":""t2"",""text"":""send""},{""id"":""t3"",""text"":""me""},{""id"":""t4"",""text"":""the report.""}]}","{""canonicalSequence"":[""t1"",""t2"",""t3"",""t4""],""canonicalSentence"":""Please send me the report.""}","published"`,
    `error-detective,00000000-0000-0000-0000-000000000001,A1,grammar,"Tìm lỗi sai trong câu và chọn cách sửa đúng nhất.","Chủ ngữ ngôi thứ ba số ít He trong thì hiện tại đơn ở thể phủ định phải dùng doesn't.",subject-verb-agreement;present-simple,"{""sentence"":""He don't agree with the new project schedule."",""segments"":[{""id"":""s1"",""text"":""He""},{""id"":""s2"",""text"":""don't agree""},{""id"":""s3"",""text"":""with""},{""id"":""s4"",""text"":""the new project schedule.""}],""correctionOptions"":[{""id"":""opt1"",""text"":""doesn't agree""},{""id"":""opt2"",""text"":""not agree""},{""id"":""opt3"",""text"":""isn't agree""}]}","{""errorSegmentId"":""s2"",""correctOptionId"":""opt1"",""grammarConcept"":""Subject-Verb Agreement"",""correctedSentence"":""He doesn't agree with the new project schedule.""}","published"`,
    `listen-choose,00000000-0000-0000-0000-000000000001,A1,listening,"Nghe đoạn ghi âm và chọn thông tin đúng về giờ họp.","Đoạn ghi âm nói cuộc họp đã được dời sang lúc 2 giờ chiều.",numbers-and-time;meeting-schedule,"{""audioPath"":""/audio/listen-q1-meeting-time.mp3"",""options"":[{""id"":""opt1"",""text"":""Cuộc họp diễn ra lúc 2:00 PM""},{""id"":""opt2"",""text"":""Cuộc họp diễn ra lúc 3:00 PM""},{""id"":""opt3"",""text"":""Cuộc họp bị hủy bỏ""},{""id"":""opt4"",""text"":""Cuộc họp dời sang ngày mai lúc 10:00 AM""}]}","{""correctOptionId"":""opt1"",""transcriptEn"":""The team meeting has been rescheduled to 2 PM.""}","published"`,
    `roleplay,00000000-0000-0000-0000-000000000001,A2,speaking,"Chọn lời phản hồi chuyên nghiệp nhất khi đàm phán gia hạn thời hạn dự án.","Khi xin dời deadline, nên nêu lý do ngắn gọn và đề xuất mốc giờ mới cụ thể.",negotiation;deadline-extension,"{""situation"":""Dự án gặp sự cố kỹ thuật và cần thêm thời gian."",""npcRole"":""Trưởng phòng Kỹ thuật"",""npcText"":""Hi, can you confirm if the deliverables will be ready by 5 PM today?"",""choices"":[{""id"":""c1"",""text"":""We encountered an issue. May we have until tomorrow morning at 10 AM to ensure quality?""},{""id"":""c2"",""text"":""No, today is impossible. You gave us too much work.""}],""isTerminal"":false}","{""evaluations"":[{""choiceId"":""c1"",""rating"":""appropriate"",""scoreDelta"":10,""feedbackVi"":""Rất xuất sắc! Giải thích ngắn gọn và đề xuất thời gian mới rõ ràng.""},{""choiceId"":""c2"",""rating"":""inappropriate"",""scoreDelta"":0,""feedbackVi"":""Chưa phù hợp. Giọng điệu mang tính đổ lỗi cho cấp trên.""}]}","published"`,
  ].join("\n");
}
