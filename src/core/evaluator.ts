import type { AnyQuestion } from "@/lib/validations/content";
import type { AnswerFeedback } from "./types";
import {
  evaluateMemoryFlip,
  evaluateSentenceBuilder,
  evaluateErrorDetective,
  evaluateListenChoose,
  evaluateRoleplay,
} from "./evaluators";

/**
 * Server-side evaluation router.
 * Inspects question type, executes game-specific evaluation, and returns authoritative feedback.
 * CRITICAL: Must only be run server-side where private_solution is available.
 */
export function evaluateAnswer(question: AnyQuestion, answer: unknown): AnswerFeedback {
  switch (question.game_type) {
    case "memory-flip":
      return evaluateMemoryFlip(question.private_solution, answer, question.explanation_vi);

    case "sentence-builder":
      return evaluateSentenceBuilder(
        question.private_solution,
        answer,
        question.explanation_vi,
        question.public_payload.tokens
      );

    case "error-detective":
      return evaluateErrorDetective(question.private_solution, answer, question.explanation_vi);

    case "listen-choose":
      return evaluateListenChoose(question.private_solution, answer, question.explanation_vi);

    case "roleplay":
      return evaluateRoleplay(question.private_solution, answer, question.explanation_vi);
  }
}

