import type { AnyQuestion } from "@/lib/validations/content";
import { MEMORY_FLIP_SAMPLE_QUESTIONS } from "@/games/memory-flip/sample-data";
import { SENTENCE_BUILDER_SAMPLE_QUESTIONS } from "@/games/sentence-builder/sample-data";
import { ERROR_DETECTIVE_SAMPLE_QUESTIONS } from "@/games/error-detective/sample-data";
import { LISTEN_CHOOSE_SAMPLE_QUESTIONS } from "@/games/listen-choose/sample-data";
import { ROLEPLAY_SAMPLE_QUESTIONS } from "@/games/roleplay/sample-data";

export interface StoredQuestionItem {
  id: string;
  game_type: string;
  prompt: string;
  skill: string;
  difficulty: string;
  status: "published" | "draft" | "review" | "archived";
  created_at?: string;
  public_payload?: Record<string, unknown>;
  private_solution?: Record<string, unknown>;
  explanation_vi?: string;
  concept_tags?: string[];
}

const CUSTOM_QUESTIONS_STORAGE_KEY = "egh_custom_questions_v1";

function isClientSide(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Retrieves all custom/imported questions stored in client localStorage
 */
export function getCustomQuestions(): StoredQuestionItem[] {
  if (!isClientSide()) return [];

  try {
    const raw = window.localStorage.getItem(CUSTOM_QUESTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves new imported questions to localStorage.
 * Rule: OVERWRITES and clears old questions of the same game_type(s).
 */
export function saveCustomQuestions(
  newQuestions: AnyQuestion[],
  overwrite = true
): StoredQuestionItem[] {
  if (!isClientSide() || newQuestions.length === 0) return [];

  try {
    const existing = getCustomQuestions();
    const timestamp = Date.now();

    const formattedNew: StoredQuestionItem[] = newQuestions.map((q, idx) => ({
      id: q.id || `imported-${q.game_type}-${timestamp}-${idx + 1}`,
      game_type: q.game_type,
      prompt: q.prompt,
      skill: q.skill,
      difficulty: q.difficulty,
      status: q.status || "published",
      created_at: new Date().toISOString(),
      public_payload: q.public_payload as Record<string, unknown>,
      private_solution: q.private_solution as Record<string, unknown>,
      explanation_vi: q.explanation_vi,
      concept_tags: q.concept_tags,
    }));

    // Identify game types present in the new batch
    const importedGameTypes = new Set<string>(newQuestions.map((q) => q.game_type));

    // If overwrite is true, delete old questions of the imported game types
    const remaining = overwrite
      ? existing.filter((q) => !importedGameTypes.has(q.game_type))
      : existing;

    const merged = [...remaining, ...formattedNew];
    window.localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.error("Failed to save custom questions to localStorage:", err);
    return [];
  }
}

/**
 * Returns all custom questions for a specific game type
 */
export function getCustomQuestionsByGame(gameType: string): AnyQuestion[] {
  const all = getCustomQuestions();
  return all.filter((q) => q.game_type === gameType) as unknown as AnyQuestion[];
}

/**
 * Deletes a single custom question by ID from localStorage
 */
export function deleteCustomQuestion(id: string): void {
  if (!isClientSide()) return;
  try {
    const existing = getCustomQuestions();
    const updated = existing.filter((q) => q.id !== id);
    window.localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to delete custom question:", err);
  }
}

/**
 * Updates status of a custom question in localStorage
 */
export function updateCustomQuestionStatus(
  id: string,
  newStatus: "published" | "draft" | "review" | "archived"
): void {
  if (!isClientSide()) return;
  try {
    const existing = getCustomQuestions();
    const updated = existing.map((q) => (q.id === id ? { ...q, status: newStatus } : q));
    window.localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to update custom question status:", err);
  }
}

/**
 * Clears all custom questions or questions of a specific game type
 */
export function clearCustomQuestions(gameType?: string): void {
  if (!isClientSide()) return;
  if (!gameType) {
    window.localStorage.removeItem(CUSTOM_QUESTIONS_STORAGE_KEY);
  } else {
    const existing = getCustomQuestions();
    const updated = existing.filter((q) => q.game_type !== gameType);
    window.localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(updated));
  }
}

/**
 * Base seed count (4 questions per game across 5 games = 20)
 */
export const BASE_SEED_COUNTS: Record<string, number> = {
  "memory-flip": MEMORY_FLIP_SAMPLE_QUESTIONS.length,
  "sentence-builder": SENTENCE_BUILDER_SAMPLE_QUESTIONS.length,
  "error-detective": ERROR_DETECTIVE_SAMPLE_QUESTIONS.length,
  "listen-choose": LISTEN_CHOOSE_SAMPLE_QUESTIONS.length,
  roleplay: ROLEPLAY_SAMPLE_QUESTIONS.length,
};

/**
 * Computes combined question statistics:
 * When a game has custom/imported questions, it OVERWRITES the seed count for that game.
 */
export function getQuestionsStatistics(): {
  totalQuestions: number;
  publishedQuestions: number;
  draftQuestions: number;
  byGame: Record<string, number>;
} {
  const custom = getCustomQuestions();

  const byGame: Record<string, number> = { ...BASE_SEED_COUNTS };
  const customByGame: Record<string, number> = {};
  let customDraft = 0;

  custom.forEach((q) => {
    customByGame[q.game_type] = (customByGame[q.game_type] || 0) + 1;
    if (q.status === "draft") {
      customDraft++;
    }
  });

  // Overwrite game count with custom imported count for any games that have imported data
  Object.keys(customByGame).forEach((gameType) => {
    byGame[gameType] = customByGame[gameType];
  });

  const totalQuestions = Object.values(byGame).reduce((a, b) => a + b, 0);

  return {
    totalQuestions,
    publishedQuestions: totalQuestions - customDraft,
    draftQuestions: customDraft,
    byGame,
  };
}
