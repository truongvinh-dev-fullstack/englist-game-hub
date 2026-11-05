import { createAdminClient } from "@/lib/supabase/service-role";
import { evaluateAnswer } from "@/core/evaluator";
import { calculateBoundedXP } from "@/core/scoring";
import type { AnswerFeedback, SessionSummary } from "@/core/types";
import type { AnyQuestion } from "@/lib/validations/content";
import type { DifficultyLevel, Json } from "@/lib/types/database.types";

export interface CreateSessionParams {
  userId: string;
  gameSlug: string;
  topicId?: string;
  difficulty?: DifficultyLevel;
}

export interface SubmitAnswerParams {
  sessionId: string;
  userId: string;
  questionId: string;
  answer: unknown;
  requestId: string;
}

export class SessionServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = "BAD_REQUEST"
  ) {
    super(message);
    this.name = "SessionServiceError";
  }
}

/**
 * Creates a new active game session for an authenticated learner.
 */
export async function createSession({
  userId,
  gameSlug,
  topicId,
  difficulty,
}: CreateSessionParams) {
  const adminClient = createAdminClient();

  // 1. Resolve game
  const { data: game, error: gameError } = await adminClient
    .from("games")
    .select("*")
    .eq("slug", gameSlug)
    .eq("is_enabled", true)
    .single();

  if (gameError || !game) {
    throw new SessionServiceError("Trò chơi không tồn tại hoặc tạm thời bị tắt.", 404, "GAME_NOT_FOUND");
  }

  // 2. Query published questions for this game type
  let query = adminClient
    .from("questions")
    .select("id")
    .eq("game_type", game.type)
    .eq("status", "published");

  if (topicId) {
    query = query.eq("topic_id", topicId);
  }
  if (difficulty) {
    query = query.eq("difficulty", difficulty);
  }

  const { data: questionsList, error: qError } = await query.limit(10);

  if (qError || !questionsList || questionsList.length === 0) {
    throw new SessionServiceError(
      "Không đủ câu hỏi phù hợp cho chủ đề này. Vui lòng chọn chủ đề hoặc độ khó khác.",
      400,
      "INSUFFICIENT_CONTENT"
    );
  }

  // Shuffle question IDs deterministically
  const seed = Math.floor(Math.random() * 1000000);
  const questionIds = questionsList.map((q) => q.id).sort(() => Math.random() - 0.5);

  // 3. Create session record
  const { data: newSession, error: createError } = await adminClient
    .from("game_sessions")
    .insert({
      user_id: userId,
      game_id: game.id,
      status: "active",
      question_ids: questionIds,
      current_index: 0,
      seed,
      total_xp: 0,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (createError || !newSession) {
    throw new SessionServiceError("Không thể tạo phiên chơi. Vui lòng thử lại.", 500, "SESSION_CREATE_FAILED");
  }

  // 4. Fetch the first question from public view (Strict zero solution leakage)
  const firstQuestionId = questionIds[0];
  const { data: publicQuestion, error: firstQError } = await adminClient
    .from("public_questions")
    .select("*")
    .eq("id", firstQuestionId)
    .single();

  if (firstQError || !publicQuestion) {
    throw new SessionServiceError("Lỗi khi tải câu hỏi đầu tiên.", 500, "QUESTION_LOAD_FAILED");
  }

  return {
    sessionId: newSession.id,
    question: publicQuestion,
    progress: {
      current: 1,
      total: questionIds.length,
    },
  };
}

/**
 * Submits an answer with idempotency checking and server-side evaluation.
 */
export async function submitSessionAnswer({
  sessionId,
  userId,
  questionId,
  answer,
  requestId,
}: SubmitAnswerParams): Promise<AnswerFeedback> {
  const adminClient = createAdminClient();

  // 1. Fetch session & verify ownership
  const { data: session, error: sessionError } = await adminClient
    .from("game_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    throw new SessionServiceError("Phiên chơi không tồn tại.", 404, "SESSION_NOT_FOUND");
  }

  if (session.user_id !== userId) {
    throw new SessionServiceError("Bạn không có quyền nộp bài cho phiên chơi này.", 403, "FORBIDDEN");
  }

  if (session.status !== "active") {
    throw new SessionServiceError("Phiên chơi này đã kết thúc hoặc không còn hiệu lực.", 400, "SESSION_INACTIVE");
  }

  // 2. IDEMPOTENCY CHECK: if this request_id has already been answered, return existing feedback!
  const { data: existingAnswer } = await adminClient
    .from("session_answers")
    .select("*")
    .eq("session_id", sessionId)
    .eq("request_id", requestId)
    .maybeSingle();

  if (existingAnswer) {
    const { data: question } = await adminClient
      .from("questions")
      .select("explanation_vi")
      .eq("id", questionId)
      .single();

    const isNextAvailable = session.current_index < session.question_ids.length;

    return {
      correct: existingAnswer.is_correct,
      explanation: question?.explanation_vi || "",
      scoreDelta: existingAnswer.score_delta,
      nextAvailable: isNextAvailable,
    };
  }

  // 3. ORDERING CHECK: Must answer the current question
  const currentExpectedQuestionId = session.question_ids[session.current_index];
  if (currentExpectedQuestionId !== questionId) {
    throw new SessionServiceError(
      "Thứ tự câu hỏi không đúng. Bạn chỉ có thể trả lời câu hỏi hiện tại.",
      400,
      "INVALID_QUESTION_ORDER"
    );
  }

  // 4. Load full question (with private_solution) securely
  const { data: questionRaw, error: qError } = await adminClient
    .from("questions")
    .select("*")
    .eq("id", questionId)
    .single();

  if (qError || !questionRaw) {
    throw new SessionServiceError("Câu hỏi không tồn tại.", 404, "QUESTION_NOT_FOUND");
  }

  // 5. Evaluate answer
  const feedback = evaluateAnswer(questionRaw as unknown as AnyQuestion, answer);

  // 6. Record answer in session_answers
  await adminClient.from("session_answers").insert({
    session_id: sessionId,
    question_id: questionId,
    request_id: requestId,
    answer: answer as Json,
    is_correct: feedback.correct,
    score_delta: feedback.scoreDelta,
  });

  // 7. Update review items if wrong
  if (!feedback.correct) {
    const { data: existingReview } = await adminClient
      .from("review_items")
      .select("*")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .maybeSingle();

    if (existingReview) {
      await adminClient
        .from("review_items")
        .update({
          wrong_count: existingReview.wrong_count + 1,
          last_seen_at: new Date().toISOString(),
          state: "reviewing",
        })
        .eq("id", existingReview.id);
    } else {
      await adminClient.from("review_items").insert({
        user_id: userId,
        question_id: questionId,
        wrong_count: 1,
        state: "new",
      });
    }
  }

  // 8. Increment current_index & accumulate score
  const newIndex = session.current_index + 1;
  const newXp = calculateBoundedXP(session.total_xp, feedback.scoreDelta);
  const isFinished = newIndex >= session.question_ids.length;

  await adminClient
    .from("game_sessions")
    .update({
      current_index: newIndex,
      total_xp: newXp,
      status: isFinished ? "completed" : "active",
      completed_at: isFinished ? new Date().toISOString() : null,
    })
    .eq("id", sessionId);

  feedback.nextAvailable = !isFinished;
  return feedback;
}

/**
 * Idempotently finalizes a session and aggregates user progress.
 */
export async function finishSession(sessionId: string, userId: string): Promise<SessionSummary> {
  const adminClient = createAdminClient();

  const { data: session, error: sessionError } = await adminClient
    .from("game_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    throw new SessionServiceError("Phiên chơi không tồn tại.", 404, "SESSION_NOT_FOUND");
  }

  if (session.user_id !== userId) {
    throw new SessionServiceError("Bạn không có quyền hoàn thành phiên chơi này.", 403, "FORBIDDEN");
  }

  // Fetch all recorded answers for this session
  const { data: answers = [] } = await adminClient
    .from("session_answers")
    .select("is_correct, score_delta")
    .eq("session_id", sessionId);

  const totalAnswered = answers?.length || 0;
  const correctCount = answers?.filter((a) => a.is_correct).length || 0;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  // If already completed, return existing summary immediately (IDEMPOTENT FINISH)
  if (session.status === "completed") {
    return {
      sessionId: session.id,
      status: "completed",
      totalQuestions: session.question_ids.length,
      answeredCount: totalAnswered,
      correctCount,
      totalXp: session.total_xp,
      accuracyPercentage: accuracy,
      startedAt: session.started_at,
      completedAt: session.completed_at,
    };
  }

  // Mark session as completed
  const now = new Date().toISOString();
  await adminClient
    .from("game_sessions")
    .update({
      status: "completed",
      completed_at: now,
    })
    .eq("id", sessionId);

  return {
    sessionId: session.id,
    status: "completed",
    totalQuestions: session.question_ids.length,
    answeredCount: totalAnswered,
    correctCount,
    totalXp: session.total_xp,
    accuracyPercentage: accuracy,
    startedAt: session.started_at,
    completedAt: now,
  };
}
