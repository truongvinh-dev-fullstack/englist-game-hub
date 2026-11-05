import type {
  MemoryFlipPrivateSolution,
  SentenceBuilderPrivateSolution,
  ErrorDetectivePrivateSolution,
  ListenChoosePrivateSolution,
  RoleplayPrivateSolution,
  AnyQuestion,
} from "@/lib/validations/content";
import type { AnswerFeedback } from "./types";

export interface EvaluationInput {
  question: AnyQuestion;
  answer: unknown;
  explanationVi: string;
}

export function evaluateMemoryFlip(
  solution: MemoryFlipPrivateSolution,
  answer: unknown,
  explanation: string
): AnswerFeedback {
  const typedAnswer = (typeof answer === "object" && answer !== null)
    ? (answer as { isBoardCleared?: boolean; matchedPairsCount?: number })
    : {};

  const isCorrect = Boolean(typedAnswer.isBoardCleared) &&
    typedAnswer.matchedPairsCount === solution.pairs.length;

  return {
    correct: isCorrect,
    explanation,
    scoreDelta: isCorrect ? 10 : 0,
    correctAnswer: solution.pairs,
    nextAvailable: true,
  };
}

export function evaluateSentenceBuilder(
  solution: SentenceBuilderPrivateSolution,
  answer: unknown,
  explanation: string,
  tokens?: Array<{ id: string; text: string }>
): AnswerFeedback {
  const typedAnswer = (typeof answer === "object" && answer !== null)
    ? (answer as {
        tokenSequence?: string[];
        tokens?: Array<{ id: string; text: string }>;
        constructedSentence?: string;
      })
    : {};

  const sequence = Array.isArray(typedAnswer.tokenSequence) ? typedAnswer.tokenSequence : [];

  // 1. Exact ID sequence matches canonical
  const matchesCanonical =
    sequence.length === solution.canonicalSequence.length &&
    sequence.every((id, idx) => id === solution.canonicalSequence[idx]);

  // 2. Exact ID sequence matches an alternative accepted sequence
  let matchesAccepted = false;
  if (!matchesCanonical && solution.acceptedSequences) {
    matchesAccepted = solution.acceptedSequences.some(
      (accepted) =>
        accepted.length === sequence.length &&
        accepted.every((id, idx) => id === sequence[idx])
    );
  }

  // 3. Word text equivalence for duplicate tokens (e.g. multiple "to", "the", "a")
  let matchesByText = false;
  const tokenList = tokens || typedAnswer.tokens;
  if (!matchesCanonical && !matchesAccepted && tokenList && tokenList.length > 0) {
    const tokenMap = new Map(tokenList.map((t) => [t.id, t.text.trim()]));

    if (sequence.length === solution.canonicalSequence.length) {
      const userWords = sequence.map((id) => tokenMap.get(id) || "");
      const canonicalWords = solution.canonicalSequence.map((id) => tokenMap.get(id) || "");

      // Compare word-by-word (case-insensitive)
      const wordsMatchCanonical = userWords.every(
        (w, idx) => w.toLowerCase() === canonicalWords[idx].toLowerCase()
      );

      if (wordsMatchCanonical) {
        matchesByText = true;
      }

      // Also check acceptedSequences word-by-word
      if (!matchesByText && solution.acceptedSequences) {
        matchesByText = solution.acceptedSequences.some((accepted) => {
          if (accepted.length !== sequence.length) return false;
          const acceptedWords = accepted.map((id) => tokenMap.get(id) || "");
          return userWords.every(
            (w, idx) => w.toLowerCase() === acceptedWords[idx].toLowerCase()
          );
        });
      }

      // Fallback: check normalized full constructed sentence string against canonicalSentence
      if (!matchesByText && solution.canonicalSentence) {
        const normalize = (s: string) =>
          s
            .replace(/\s+/g, " ")
            .replace(/\s+([.,!?;:])/g, "$1")
            .trim()
            .toLowerCase();

        const userSentence = userWords.join(" ");
        if (normalize(userSentence) === normalize(solution.canonicalSentence)) {
          matchesByText = true;
        }
      }
    }
  }

  const isCorrect = matchesCanonical || matchesAccepted || matchesByText;

  return {
    correct: isCorrect,
    explanation,
    scoreDelta: isCorrect ? 10 : 0,
    correctAnswer: solution.canonicalSentence,
    nextAvailable: true,
  };
}

export function evaluateErrorDetective(
  solution: ErrorDetectivePrivateSolution,
  answer: unknown,
  explanation: string
): AnswerFeedback {
  const typedAnswer = (typeof answer === "object" && answer !== null)
    ? (answer as { selectedSegmentId?: string; selectedOptionId?: string })
    : {};

  const isSegmentCorrect = typedAnswer.selectedSegmentId === solution.errorSegmentId;
  const isOptionCorrect = typedAnswer.selectedOptionId === solution.correctOptionId;
  const isCorrect = isSegmentCorrect && isOptionCorrect;

  return {
    correct: isCorrect,
    explanation,
    scoreDelta: isCorrect ? 10 : 0,
    correctAnswer: solution.correctedSentence,
    nextAvailable: true,
  };
}

export function evaluateListenChoose(
  solution: ListenChoosePrivateSolution,
  answer: unknown,
  explanation: string
): AnswerFeedback {
  const typedAnswer = (typeof answer === "object" && answer !== null)
    ? (answer as { selectedOptionId?: string })
    : {};

  const isCorrect = typedAnswer.selectedOptionId === solution.correctOptionId;

  return {
    correct: isCorrect,
    explanation,
    scoreDelta: isCorrect ? 10 : 0,
    correctAnswer: {
      correctOptionId: solution.correctOptionId,
      transcriptEn: solution.transcriptEn,
    },
    nextAvailable: true,
  };
}

export function evaluateRoleplay(
  solution: RoleplayPrivateSolution,
  answer: unknown,
  explanation: string
): AnswerFeedback {
  const typedAnswer = (typeof answer === "object" && answer !== null)
    ? (answer as { selectedChoiceId?: string })
    : {};

  const matchedEvaluation = solution.evaluations.find(
    (ev) => ev.choiceId === typedAnswer.selectedChoiceId
  );

  if (!matchedEvaluation) {
    return {
      correct: false,
      explanation,
      scoreDelta: 0,
      nextAvailable: true,
    };
  }

  const isAppropriate = matchedEvaluation.rating === "appropriate";
  const contextualExplanation = matchedEvaluation.feedbackVi
    ? `${matchedEvaluation.feedbackVi} (${explanation})`
    : explanation;

  return {
    correct: isAppropriate,
    explanation: contextualExplanation,
    scoreDelta: matchedEvaluation.scoreDelta,
    correctAnswer: {
      rating: matchedEvaluation.rating,
      choiceId: matchedEvaluation.choiceId,
    },
    nextAvailable: true,
  };
}

