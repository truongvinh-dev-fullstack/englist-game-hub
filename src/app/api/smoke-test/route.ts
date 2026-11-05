import { NextResponse } from "next/server";
import { evaluateAnswer } from "@/core/evaluator";
import { SENTENCE_BUILDER_SAMPLE_QUESTIONS } from "@/games/sentence-builder/sample-data";
import { ERROR_DETECTIVE_SAMPLE_QUESTIONS } from "@/games/error-detective/sample-data";
import { LISTEN_CHOOSE_SAMPLE_QUESTIONS } from "@/games/listen-choose/sample-data";
import { ROLEPLAY_SAMPLE_QUESTIONS } from "@/games/roleplay/sample-data";
import { MEMORY_FLIP_SAMPLE_QUESTIONS } from "@/games/memory-flip/sample-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const results: Array<{ test: string; passed: boolean; message?: string }> = [];

  // Test 1: Memory Flip Evaluator
  try {
    const q = MEMORY_FLIP_SAMPLE_QUESTIONS[0];
    const res = evaluateAnswer(q, { isBoardCleared: true, matchedPairsCount: 4 });
    results.push({
      test: "memory-flip-evaluator",
      passed: res.correct && res.scoreDelta === 10,
    });
  } catch (err: unknown) {
    results.push({
      test: "memory-flip-evaluator",
      passed: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // Test 3: Sentence Builder Evaluator
  try {
    const q = SENTENCE_BUILDER_SAMPLE_QUESTIONS[0];
    const res = evaluateAnswer(q, {
      tokenSequence: q.private_solution.canonicalSequence,
    });
    results.push({
      test: "sentence-builder-evaluator",
      passed: res.correct && res.scoreDelta === 10,
    });
  } catch (err: unknown) {
    results.push({
      test: "sentence-builder-evaluator",
      passed: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // Test 4: Error Detective Evaluator
  try {
    const q = ERROR_DETECTIVE_SAMPLE_QUESTIONS[0];
    const res = evaluateAnswer(q, {
      selectedSegmentId: q.private_solution.errorSegmentId,
      selectedOptionId: q.private_solution.correctOptionId,
    });
    results.push({
      test: "error-detective-evaluator",
      passed: res.correct && res.scoreDelta === 10,
    });
  } catch (err: unknown) {
    results.push({
      test: "error-detective-evaluator",
      passed: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // Test 5: Listen & Choose Evaluator
  try {
    const q = LISTEN_CHOOSE_SAMPLE_QUESTIONS[0];
    const res = evaluateAnswer(q, {
      selectedOptionId: q.private_solution.correctOptionId,
    });
    results.push({
      test: "listen-choose-evaluator",
      passed: res.correct && res.scoreDelta === 10,
    });
  } catch (err: unknown) {
    results.push({
      test: "listen-choose-evaluator",
      passed: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // Test 6: Roleplay Simulator Evaluator
  try {
    const q = ROLEPLAY_SAMPLE_QUESTIONS[0];
    const bestEval = q.private_solution.evaluations.find((e) => e.rating === "appropriate");
    const res = evaluateAnswer(q, {
      selectedChoiceId: bestEval?.choiceId,
    });
    results.push({
      test: "roleplay-evaluator",
      passed: res.correct && res.scoreDelta === 10,
    });
  } catch (err: unknown) {
    results.push({
      test: "roleplay-evaluator",
      passed: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  const allPassed = results.every((r) => r.passed);
  const durationMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: allPassed ? "ok" : "degraded",
      allPassed,
      testsPassed: results.filter((r) => r.passed).length,
      totalTests: results.length,
      durationMs,
      results,
    },
    {
      status: allPassed ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

