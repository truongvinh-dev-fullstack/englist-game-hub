"use client";

import React, { useState, useTransition, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GameHeader } from "@/components/game-shared/GameHeader";
import { QuestionPrompt } from "@/components/game-shared/QuestionPrompt";
import { FeedbackPanel } from "@/components/game-shared/FeedbackPanel";
import { recordGuestAnswer } from "@/lib/storage/guest-storage";
import { getCustomQuestionsByGame } from "@/lib/storage/question-storage";
import { MemoryFlipRenderer } from "@/games/memory-flip/MemoryFlipRenderer";
import { MEMORY_FLIP_SAMPLE_QUESTIONS } from "@/games/memory-flip/sample-data";
import type { MemoryFlipAnswer } from "@/games/memory-flip/adapter";
import { SentenceBuilderRenderer } from "@/games/sentence-builder/SentenceBuilderRenderer";
import { SENTENCE_BUILDER_SAMPLE_QUESTIONS } from "@/games/sentence-builder/sample-data";
import { ErrorDetectiveRenderer } from "@/games/error-detective/ErrorDetectiveRenderer";
import { ERROR_DETECTIVE_SAMPLE_QUESTIONS } from "@/games/error-detective/sample-data";
import { ListenChooseRenderer } from "@/games/listen-choose/ListenChooseRenderer";
import { LISTEN_CHOOSE_SAMPLE_QUESTIONS } from "@/games/listen-choose/sample-data";
import { RoleplayRenderer } from "@/games/roleplay/RoleplayRenderer";
import { ROLEPLAY_SAMPLE_QUESTIONS } from "@/games/roleplay/sample-data";
import { evaluateAnswer } from "@/core/evaluator";
import { saveStageRecord } from "@/lib/storage/game-record-storage";

// Fallback demo question pool for quick practice
const DEFAULT_SAMPLE_QUESTIONS = [
  {
    id: "demo-q1",
    prompt: "Chọn nghĩa tiếng Việt của từ: 'Deadline'",
    subPrompt: "Thường dùng trong quản lý tiến độ công việc và bàn giao dự án.",
    difficulty: "A1",
    skill: "Từ vựng",
    conceptTags: ["office", "workflow"],
    explanation: "Deadline có nghĩa là hạn chót hoặc thời hạn cuối cùng phải hoàn thành công việc.",
    options: [
      { id: "1", text: "Hạn chót hoàn thành" },
      { id: "2", text: "Thời gian bắt đầu" },
      { id: "3", text: "Biên bản cuộc họp" },
      { id: "4", text: "Người quản lý dự án" },
    ],
    correctOptionId: "1",
  },
  {
    id: "demo-q2",
    prompt: "Chọn từ thích hợp điền vào chỗ trống: 'Please ______ the meeting agenda.'",
    subPrompt: "Hãy chọn động từ đúng theo ngữ cảnh văn phòng.",
    difficulty: "A2",
    skill: "Ngữ pháp",
    conceptTags: ["meeting", "collocations"],
    explanation: "'Review the agenda' là cụm từ chuẩn có nghĩa là xem lại chương trình cuộc họp.",
    options: [
      { id: "1", text: "review" },
      { id: "2", text: "reviews" },
      { id: "3", text: "reviewing" },
      { id: "4", text: "to review" },
    ],
    correctOptionId: "1",
  },
];

function GamePlayContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || "memory-flip";

  const selectedTopic = searchParams?.get("topic") || "all";
  const stage = Math.max(1, parseInt(searchParams?.get("stage") || "1", 10));
  const limitParam = parseInt(searchParams?.get("limit") || "10", 10);
  const sessionLimit = limitParam > 0 ? limitParam : 10;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    isCorrect: boolean;
    scoreDelta: number;
    explanation: string;
    correctAnswerText?: string;
  } | null>(null);

  const [sessionStats, setSessionStats] = useState({
    correctCount: 0,
    totalXp: 0,
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live timer for tracking stage play time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [isSubmitting, startTransition] = useTransition();

  const isMemoryFlip = slug === "memory-flip";
  const isSentenceBuilder = slug === "sentence-builder";
  const isErrorDetective = slug === "error-detective";
  const isListenChoose = slug === "listen-choose";
  const isRoleplay = slug === "roleplay";

  const canSubmit = isSentenceBuilder
    ? selectedSequence.length > 0
    : isErrorDetective
    ? Boolean(selectedSegmentId && selectedOptionId)
    : Boolean(selectedOptionId);

  const baseQuestionPool = isMemoryFlip
    ? MEMORY_FLIP_SAMPLE_QUESTIONS
    : isSentenceBuilder
    ? SENTENCE_BUILDER_SAMPLE_QUESTIONS
    : isErrorDetective
    ? ERROR_DETECTIVE_SAMPLE_QUESTIONS
    : isListenChoose
    ? LISTEN_CHOOSE_SAMPLE_QUESTIONS
    : isRoleplay
    ? ROLEPLAY_SAMPLE_QUESTIONS
    : DEFAULT_SAMPLE_QUESTIONS;

  const [customPool, setCustomPool] = useState<unknown[]>([]);

  useEffect(() => {
    const custom = getCustomQuestionsByGame(slug);
    if (custom.length > 0) {
      setCustomPool(custom);
    }
  }, [slug]);

  // 1. Raw pool
  const rawPool = customPool.length > 0 ? customPool : baseQuestionPool;

  // 2. Filter by topic
  const topicFilteredPool = useMemo(() => {
    if (!selectedTopic || selectedTopic === "all") return rawPool;
    return rawPool.filter((item) => {
      const q = item as Record<string, unknown>;
      const tags = (q.concept_tags || q.conceptTags || []) as string[];
      const topicId = String(q.topic_id || "");
      return (
        topicId.toLowerCase() === selectedTopic.toLowerCase() ||
        tags.some((t) => t.toLowerCase() === selectedTopic.toLowerCase())
      );
    });
  }, [rawPool, selectedTopic]);

  // 3. Slice by Stage / Session Size and randomize questions in session
  const questionPool = useMemo(() => {
    let pool = topicFilteredPool;
    if (topicFilteredPool.length > sessionLimit) {
      const startIndex = (stage - 1) * sessionLimit;
      const paged = topicFilteredPool.slice(startIndex, startIndex + sessionLimit);
      pool = paged.length > 0 ? paged : topicFilteredPool.slice(0, sessionLimit);
    }
    // Shuffle questions in session so they do not follow fixed table order
    const list = [...pool];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, [topicFilteredPool, stage, sessionLimit]);

  const currentQuestion = (questionPool[currentIndex] || questionPool[0]) as (typeof baseQuestionPool)[0];
  const totalQuestions = questionPool.length;
  const isLastQuestion = currentIndex >= totalQuestions - 1;

  const handleSelectOption = (optionId: string) => {
    if (feedback?.isOpen) return; // Prevent selection when feedback is showing
    setSelectedOptionId(optionId);
  };

  const handleMemoryFlipComplete = (answer: MemoryFlipAnswer) => {
    if (feedback?.isOpen) return;

    startTransition(() => {
      const isCorrect = answer.isBoardCleared;
      const scoreDelta = isCorrect ? 10 : 0;
      const questionId = "id" in currentQuestion ? (currentQuestion.id as string) : `q-${currentIndex}`;

      recordGuestAnswer(questionId, isCorrect);

      setSessionStats((prev) => ({
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        totalXp: prev.totalXp + scoreDelta,
      }));

      const explanation = "explanation_vi" in currentQuestion
        ? currentQuestion.explanation_vi
        : currentQuestion.explanation;

      setFeedback({
        isOpen: true,
        isCorrect,
        scoreDelta,
        explanation,
      });
    });
  };

  const handleSubmitAnswer = () => {
    if (isSubmitting || feedback?.isOpen) return;
    if (!isSentenceBuilder && !isErrorDetective && !selectedOptionId) return;
    if (isSentenceBuilder && selectedSequence.length === 0) return;
    if (isErrorDetective && (!selectedSegmentId || !selectedOptionId)) return;

    startTransition(() => {
      let isCorrect = false;
      let scoreDelta = 0;
      let correctAnswerText: string | undefined;

      if ("game_type" in currentQuestion) {
        if (currentQuestion.game_type === "sentence-builder") {
          const evalRes = evaluateAnswer(currentQuestion, {
            tokenSequence: selectedSequence,
            tokens: currentQuestion.public_payload.tokens,
          });
          isCorrect = evalRes.correct;
          scoreDelta = evalRes.scoreDelta;
          correctAnswerText = !isCorrect ? currentQuestion.private_solution.canonicalSentence : undefined;
        } else if (currentQuestion.game_type === "error-detective") {
          const evalRes = evaluateAnswer(currentQuestion, {
            selectedSegmentId,
            selectedOptionId,
          });
          isCorrect = evalRes.correct;
          scoreDelta = evalRes.scoreDelta;
          correctAnswerText = !isCorrect ? currentQuestion.private_solution.correctedSentence : undefined;
        } else if (currentQuestion.game_type === "listen-choose") {
          const evalRes = evaluateAnswer(currentQuestion, {
            selectedOptionId,
          });
          isCorrect = evalRes.correct;
          scoreDelta = evalRes.scoreDelta;
          const correctOpt = currentQuestion.public_payload.options.find(
            (o) => o.id === currentQuestion.private_solution.correctOptionId
          );
          const transcript = currentQuestion.private_solution.transcriptEn;
          correctAnswerText = !isCorrect
            ? `${correctOpt?.text} (Transcript: "${transcript}")`
            : `Transcript: "${transcript}"`;
        } else if (currentQuestion.game_type === "roleplay") {
          const evalRes = evaluateAnswer(currentQuestion, {
            selectedChoiceId: selectedOptionId,
          });
          isCorrect = evalRes.correct;
          scoreDelta = evalRes.scoreDelta;
          const bestEval = currentQuestion.private_solution.evaluations.find(
            (e) => e.rating === "appropriate"
          );
          const bestChoice = currentQuestion.public_payload.choices.find(
            (c) => c.id === bestEval?.choiceId
          );
          correctAnswerText = !isCorrect && bestChoice
            ? `Gợi ý phản hồi tối ưu: "${bestChoice.text}"`
            : undefined;
        }
      } else {
        // Default sample question
        isCorrect = selectedOptionId === currentQuestion.correctOptionId;
        scoreDelta = isCorrect ? 10 : 0;
        const correctOpt = currentQuestion.options.find(
          (o) => o.id === currentQuestion.correctOptionId
        );
        correctAnswerText = !isCorrect ? correctOpt?.text : undefined;
      }

      // Record in local guest storage
      const questionId = "id" in currentQuestion ? (currentQuestion.id as string) : `q-${currentIndex}`;
      recordGuestAnswer(questionId, isCorrect);

      setSessionStats((prev) => ({
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        totalXp: prev.totalXp + scoreDelta,
      }));

      const explanation = "explanation_vi" in currentQuestion
        ? currentQuestion.explanation_vi
        : currentQuestion.explanation;

      setFeedback({
        isOpen: true,
        isCorrect,
        scoreDelta,
        explanation,
        correctAnswerText,
      });
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Navigate to result screen
      const finalCorrect = sessionStats.correctCount;
      const finalXp = sessionStats.totalXp;
      const timeSpent = elapsedSeconds;

      // Save stage record and detect personal best
      const recordResult = saveStageRecord({
        gameSlug: slug,
        stage,
        topic: selectedTopic,
        timeSeconds: timeSpent,
        correctCount: finalCorrect,
        totalQuestions,
        xp: finalXp,
      });

      const nextStage = stage + 1;
      const hasNextStage = stage * sessionLimit < topicFilteredPool.length;

      let resultUrl = `/games/${slug}/result?total=${totalQuestions}&correct=${finalCorrect}&xp=${finalXp}&stage=${stage}&time=${timeSpent}&bestTime=${recordResult.record.bestTimeSeconds}&isNewRecord=${recordResult.isNewBestTime ? "1" : "0"}`;
      if (hasNextStage) {
        resultUrl += `&nextStage=${nextStage}`;
      }
      if (selectedTopic && selectedTopic !== "all") {
        resultUrl += `&topic=${encodeURIComponent(selectedTopic)}`;
      }
      router.push(resultUrl);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setSelectedSequence([]);
      setSelectedSegmentId(null);
      setFeedback(null);
    }
  };

  const handleExit = () => {
    router.push("/games");
  };

  return (
    <AppShell hideHeader={true} hideBottomNav={true}>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Game Focused Header */}
        <GameHeader
          current={currentIndex + 1}
          total={totalQuestions}
          sessionXp={sessionStats.totalXp}
          elapsedSeconds={elapsedSeconds}
          onExit={handleExit}
        />

        {/* Play Area */}
        <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 flex flex-col justify-between">
          <div className="space-y-6">
            <QuestionPrompt
              prompt={currentQuestion.prompt}
              subPrompt={"subPrompt" in currentQuestion ? currentQuestion.subPrompt : undefined}
              difficulty={currentQuestion.difficulty}
              skill={currentQuestion.skill}
              conceptTags={"concept_tags" in currentQuestion ? currentQuestion.concept_tags : currentQuestion.conceptTags}
            />

            {/* Game-specific Renderer */}
            {"game_type" in currentQuestion && currentQuestion.game_type === "memory-flip" ? (
              <MemoryFlipRenderer
                key={("id" in currentQuestion ? currentQuestion.id : `q-${currentIndex}`) as string}
                payload={currentQuestion.public_payload}
                disabled={Boolean(feedback?.isOpen)}
                onComplete={handleMemoryFlipComplete}
              />
            ) : "game_type" in currentQuestion && currentQuestion.game_type === "sentence-builder" ? (
              <SentenceBuilderRenderer
                key={("id" in currentQuestion ? currentQuestion.id : `q-${currentIndex}`) as string}
                payload={currentQuestion.public_payload}
                selectedSequence={selectedSequence}
                disabled={Boolean(feedback?.isOpen)}
                onSequenceChange={setSelectedSequence}
                onSubmit={handleSubmitAnswer}
              />
            ) : "game_type" in currentQuestion && currentQuestion.game_type === "error-detective" ? (
              <ErrorDetectiveRenderer
                key={("id" in currentQuestion ? currentQuestion.id : `q-${currentIndex}`) as string}
                payload={currentQuestion.public_payload}
                selectedSegmentId={selectedSegmentId}
                selectedOptionId={selectedOptionId}
                disabled={Boolean(feedback?.isOpen)}
                onSelectSegment={setSelectedSegmentId}
                onSelectOption={handleSelectOption}
                onSubmit={handleSubmitAnswer}
              />
            ) : "game_type" in currentQuestion && currentQuestion.game_type === "listen-choose" ? (
              <ListenChooseRenderer
                key={("id" in currentQuestion ? currentQuestion.id : `q-${currentIndex}`) as string}
                payload={currentQuestion.public_payload}
                speechText={
                  currentQuestion.public_payload.speechText ||
                  ("private_solution" in currentQuestion &&
                  typeof currentQuestion.private_solution === "object" &&
                  currentQuestion.private_solution !== null &&
                  "transcriptEn" in currentQuestion.private_solution
                    ? (currentQuestion.private_solution as { transcriptEn?: string }).transcriptEn
                    : undefined)
                }
                selectedOptionId={selectedOptionId}
                disabled={Boolean(feedback?.isOpen)}
                onSelectOption={handleSelectOption}
                onSubmit={handleSubmitAnswer}
              />
            ) : "game_type" in currentQuestion && currentQuestion.game_type === "roleplay" ? (
              <RoleplayRenderer
                key={("id" in currentQuestion ? currentQuestion.id : `q-${currentIndex}`) as string}
                payload={currentQuestion.public_payload}
                selectedChoiceId={selectedOptionId}
                disabled={Boolean(feedback?.isOpen)}
                onSelectChoice={handleSelectOption}
                onSubmit={handleSubmitAnswer}
              />
            ) : (
              /* Fallback Options for other game stubs */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {"options" in currentQuestion &&
                  currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOptionId === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectOption(option.id)}
                        disabled={feedback?.isOpen}
                        className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all min-h-touch focus-visible:outline-2 focus-visible:outline-primary ${
                          isSelected
                            ? "border-primary bg-blue-50/80 text-primary font-bold shadow-xs ring-2 ring-primary/20"
                            : "border-slate-200 bg-surface text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm leading-snug">{option.text}</span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Bottom Action Button (When feedback not open and not self-completing game like Memory Flip) */}
          {!feedback?.isOpen && !isMemoryFlip && (
            <div className="pt-8 pb-4 safe-area-bottom">
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={!canSubmit || isSubmitting}
                className="w-full min-h-touch rounded-2xl bg-primary px-6 py-3.5 text-base font-bold text-white shadow-md hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? "Đang kiểm tra..." : "Kiểm tra"}</span>
              </button>
            </div>
          )}
        </main>

        {/* Answer Feedback Bottom Sheet */}
        {feedback && (
          <FeedbackPanel
            isOpen={feedback.isOpen}
            isCorrect={feedback.isCorrect}
            scoreDelta={feedback.scoreDelta}
            explanation={feedback.explanation}
            correctAnswerText={feedback.correctAnswerText}
            isLastQuestion={isLastQuestion}
            onNext={handleNext}
          />
        )}
      </div>
    </AppShell>
  );
}

export default function GamePlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-500 text-sm">
          Đang chuẩn bị màn chơi...
        </div>
      }
    >
      <GamePlayContent />
    </Suspense>
  );
}

