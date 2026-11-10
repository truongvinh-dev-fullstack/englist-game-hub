import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/service-role";
import type { GameType, DifficultyLevel, SkillType, Json } from "@/lib/types/database.types";

const DEFAULT_TOPIC_ID = "00000000-0000-0000-0000-000000000001";
const VALID_SKILLS: SkillType[] = ["vocabulary", "grammar", "listening", "speaking"];
const VALID_DIFFICULTIES: DifficultyLevel[] = ["A0", "A1", "A2", "B1"];

function normalizeSkill(skill: unknown, gameType: string): SkillType {
  const s = String(skill || "").toLowerCase() as SkillType;
  if (VALID_SKILLS.includes(s)) return s;
  if (s.includes("từ vựng") || s.includes("vocab")) return "vocabulary";
  if (s.includes("ngữ pháp") || s.includes("grammar")) return "grammar";
  if (s.includes("nghe") || s.includes("listen")) return "listening";
  if (s.includes("nói") || s.includes("thoại") || s.includes("speak")) return "speaking";

  switch (gameType) {
    case "memory-flip":
      return "vocabulary";
    case "sentence-builder":
    case "error-detective":
      return "grammar";
    case "listen-choose":
      return "listening";
    case "roleplay":
      return "speaking";
    default:
      return "vocabulary";
  }
}

function normalizeDifficulty(diff: unknown): DifficultyLevel {
  const d = String(diff || "").toUpperCase().trim() as DifficultyLevel;
  if (VALID_DIFFICULTIES.includes(d)) return d;
  return "A1";
}

// GET /api/questions?game=listen-choose
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameSlug = searchParams.get("game");

    if (!gameSlug) {
      return NextResponse.json({ error: "Missing game parameter" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("questions")
      .select("*")
      .eq("game_type", gameSlug as GameType)
      .eq("status", "published")
      .order("created_at", { ascending: true })
      .limit(5000);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ questions: data || [] });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST /api/questions - Batch import questions into Supabase
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const questions = body.questions;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "No questions provided" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Ensure default topic exists to prevent foreign key errors
    await admin.from("topics").upsert({
      id: DEFAULT_TOPIC_ID,
      slug: "general",
      title_vi: "Tiếng Anh Giao Tiếp Công Sở Cơ Bản",
      description: "Bộ câu hỏi mặc định",
      status: "published",
    });

    const dbRows = questions.map((q: Record<string, unknown>) => {
      const gameType = ((q.game_type as string) || "memory-flip") as GameType;
      const topicId = typeof q.topic_id === "string" && q.topic_id.length === 36 ? q.topic_id : DEFAULT_TOPIC_ID;
      return {
        game_type: gameType,
        topic_id: topicId,
        difficulty: normalizeDifficulty(q.difficulty),
        skill: normalizeSkill(q.skill, gameType),
        prompt: String(q.prompt || ""),
        public_payload: (q.public_payload || {}) as Json,
        private_solution: (q.private_solution || {}) as Json,
        explanation_vi: String(q.explanation_vi || ""),
        concept_tags: Array.isArray(q.concept_tags) ? (q.concept_tags as string[]) : [],
        status: "published" as const,
        version: 1,
      };
    });

    const BATCH_SIZE = 100;
    let insertedCount = 0;

    for (let i = 0; i < dbRows.length; i += BATCH_SIZE) {
      const batch = dbRows.slice(i, i + BATCH_SIZE);
      const { error: insertErr } = await admin.from("questions").insert(batch);
      if (insertErr) {
        console.error("Batch insert error:", insertErr);
        return NextResponse.json(
          {
            error: `Lỗi khi lưu đợt ${Math.floor(i / BATCH_SIZE) + 1}: ${insertErr.message}`,
            insertedSoFar: insertedCount,
          },
          { status: 500 }
        );
      }
      insertedCount += batch.length;
    }

    return NextResponse.json({
      success: true,
      count: insertedCount,
      message: `Đã lưu thành công ${insertedCount} câu hỏi lên Supabase Cloud Database!`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error during import" },
      { status: 500 }
    );
  }
}
