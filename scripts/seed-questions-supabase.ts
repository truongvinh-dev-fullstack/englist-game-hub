import fs from "fs";
import path from "path";
import { parseGameExcelOrCsv, type SupportedGameType } from "../src/lib/services/excel-game-importer.service";
import { createAdminClient } from "../src/lib/supabase/service-role";
import type { GameType, DifficultyLevel, SkillType, Json } from "../src/lib/types/database.types";

const FILES_CONFIG: { file: string; game: SupportedGameType }[] = [
  { file: "sentence_builder_1000_cau_giao_tiep_nguoi_di_lam.xlsx", game: "sentence-builder" },
  { file: "error_detective_1000_cau_giao_tiep_nguoi_di_lam.xlsx", game: "error-detective" },
  { file: "listen_choose_3000_cau_giao_tiep_nguoi_di_lam.xlsx", game: "listen-choose" },
  { file: "memory_flip_3000_giao_tiep_nguoi_di_lam.xlsx", game: "memory-flip" },
  { file: "roleplay_simulator_1000_tinh_huong_nguoi_di_lam.xlsx", game: "roleplay" },
];

const DEFAULT_TOPIC_ID = "00000000-0000-0000-0000-000000000001";
const BATCH_SIZE = 100;

async function seedAllQuestions() {
  console.log("=== BẮT ĐẦU ĐỒNG BỘ CÂU HỎI TỪ EXCEL LÊN SUPABASE CLOUD ===");
  const adminClient = createAdminClient();

  // 1. Verify connection
  const { data: games, error: gamesErr } = await adminClient.from("games").select("slug");
  if (gamesErr || !games) {
    console.error("Không thể kết nối Supabase:", gamesErr);
    process.exit(1);
  }
  console.log("Kết nối Supabase thành công! Các games khả dụng:", games.map((g) => g.slug).join(", "));

  let grandTotal = 0;

  for (const item of FILES_CONFIG) {
    const filePath = path.join(process.cwd(), "docs", "file_mau", item.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File không tồn tại: ${filePath}, bỏ qua.`);
      continue;
    }

    console.log(`\nĐang đọc và phân tích file: ${item.file} cho game '${item.game}'...`);
    const buffer = fs.readFileSync(filePath);
    const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const result = parseGameExcelOrCsv(ab, item.game);

    console.log(`- Tìm thấy: ${result.totalRows} hàng | Hợp lệ: ${result.validCount} câu.`);

    if (result.validCount === 0) {
      console.warn(`Không có câu hỏi hợp lệ trong file ${item.file}`);
      continue;
    }

    // Format questions for Supabase insertion
    const dbRows = result.validQuestions.map((q) => {
      const qAny = q as Record<string, unknown>;
      return {
        game_type: item.game as GameType,
        topic_id: (qAny.topic_id as string) || DEFAULT_TOPIC_ID,
        difficulty: ((qAny.difficulty as string) || "A1") as DifficultyLevel,
        skill: ((qAny.skill as string) || "vocabulary") as SkillType,
        prompt: (qAny.prompt as string) || "",
        public_payload: (qAny.public_payload || {}) as Json,
        private_solution: (qAny.private_solution || {}) as Json,
        explanation_vi: (qAny.explanation_vi as string) || "",
        concept_tags: Array.isArray(qAny.concept_tags) ? (qAny.concept_tags as string[]) : [],
        status: "published" as const,
        version: 1,
      };
    });

    // Batch insert into public.questions
    console.log(`Đang nạp ${dbRows.length} câu vào bảng 'questions' theo batch ${BATCH_SIZE}...`);
    let insertedCount = 0;

    for (let i = 0; i < dbRows.length; i += BATCH_SIZE) {
      const batch = dbRows.slice(i, i + BATCH_SIZE);
      const { error: insertErr } = await adminClient.from("questions").insert(batch);

      if (insertErr) {
        console.error(`Lỗi khi nạp batch ${i / BATCH_SIZE + 1}:`, insertErr.message);
        // Continue to next batch
      } else {
        insertedCount += batch.length;
        process.stdout.write(`\rĐã nạp ${insertedCount}/${dbRows.length} câu cho ${item.game}...`);
      }
    }

    console.log(`\nHoàn tất nạp game '${item.game}': ${insertedCount} câu thành công!`);
    grandTotal += insertedCount;
  }

  console.log(`\n======================================================`);
  console.log(`TỔNG CỘNG ĐÃ NẠP THÀNH CÔNG: ${grandTotal} CÂU HỎI LÊN SUPABASE!`);
  console.log(`======================================================\n`);
}

seedAllQuestions().catch((err) => {
  console.error("Lỗi thực thi seed script:", err);
  process.exit(1);
});

