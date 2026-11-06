import type { AnyQuestion } from "@/lib/validations/content";
import { MEMORY_FLIP_SAMPLE_QUESTIONS } from "@/games/memory-flip/sample-data";
import { SENTENCE_BUILDER_SAMPLE_QUESTIONS } from "@/games/sentence-builder/sample-data";
import { ERROR_DETECTIVE_SAMPLE_QUESTIONS } from "@/games/error-detective/sample-data";
import { LISTEN_CHOOSE_SAMPLE_QUESTIONS } from "@/games/listen-choose/sample-data";
import { ROLEPLAY_SAMPLE_QUESTIONS } from "@/games/roleplay/sample-data";
import { getIdbItem, setIdbItem, deleteIdbItem } from "./idb-storage";

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

// In-memory cache for fast synchronous access
let memoryQuestionsCache: StoredQuestionItem[] | null = null;
let isIdbLoadingPromise: Promise<StoredQuestionItem[]> | null = null;
let isIdbHydrated = false;

function isClientSide(): boolean {
  return typeof window !== "undefined";
}

function notifyQuestionsUpdated() {
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    try {
      window.dispatchEvent(new CustomEvent("egh_questions_updated"));
    } catch {
      // Ignore if CustomEvent not supported
    }
  }
}

/**
 * Asynchronously loads questions from IndexedDB (or fallback to localStorage)
 * Populates memory cache and dispatches update event if data was loaded.
 */
export async function loadCustomQuestionsAsync(): Promise<StoredQuestionItem[]> {
  if (!isClientSide()) return [];

  // Return existing memory cache ONLY if IndexedDB has already hydrated it
  if (isIdbHydrated && memoryQuestionsCache !== null) {
    return memoryQuestionsCache;
  }

  // Prevent multiple parallel IndexedDB reads
  if (isIdbLoadingPromise) {
    return isIdbLoadingPromise;
  }

  isIdbLoadingPromise = (async () => {
    try {
      // 1. Try reading from IndexedDB (supports unlimited MBs for 3,000+ questions)
      const idbData = await getIdbItem<StoredQuestionItem[]>(CUSTOM_QUESTIONS_STORAGE_KEY);
      if (Array.isArray(idbData) && idbData.length > 0) {
        memoryQuestionsCache = idbData;
        isIdbHydrated = true;
        notifyQuestionsUpdated();
        return idbData;
      }

      // 2. Fallback to localStorage if IDB has nothing yet
      if (typeof window.localStorage !== "undefined") {
        const raw = window.localStorage.getItem(CUSTOM_QUESTIONS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryQuestionsCache = parsed;
            isIdbHydrated = true;
            // Also sync to IndexedDB for future high-capacity persistence
            setIdbItem(CUSTOM_QUESTIONS_STORAGE_KEY, parsed).catch(() => {});
            notifyQuestionsUpdated();
            return parsed;
          }
        }
      }

      memoryQuestionsCache = memoryQuestionsCache || [];
      isIdbHydrated = true;
      return memoryQuestionsCache;
    } catch (err) {
      console.warn("Failed to load questions from storage:", err);
      memoryQuestionsCache = memoryQuestionsCache || [];
      isIdbHydrated = true;
      return memoryQuestionsCache;
    } finally {
      isIdbLoadingPromise = null;
    }
  })();

  return isIdbLoadingPromise;
}

/**
 * Asynchronously returns custom questions for a specific game type
 */
export async function loadCustomQuestionsByGameAsync(gameType: string): Promise<AnyQuestion[]> {
  const all = await loadCustomQuestionsAsync();
  return all.filter((q) => q.game_type === gameType) as unknown as AnyQuestion[];
}

/**
 * Synchronous access for React render cycles (reads memory cache, then localStorage,
 * and triggers async IDB hydration if memory cache is not yet warm).
 */
export function getCustomQuestions(): StoredQuestionItem[] {
  if (!isClientSide()) return [];

  if (memoryQuestionsCache !== null) {
    return memoryQuestionsCache;
  }

  // Try synchronous localStorage read
  try {
    if (typeof window.localStorage !== "undefined") {
      const raw = window.localStorage.getItem(CUSTOM_QUESTIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryQuestionsCache = parsed;
          return parsed;
        }
      }
    }
  } catch {
    // LocalStorage read error or quota issue
  }

  // Kick off background IndexedDB load to warm cache
  loadCustomQuestionsAsync().catch(() => {});

  return [];
}

/**
 * Synchronous get by game type
 */
export function getCustomQuestionsByGame(gameType: string): AnyQuestion[] {
  const all = getCustomQuestions();
  return all.filter((q) => q.game_type === gameType) as unknown as AnyQuestion[];
}

/**
 * Saves new imported questions to high-capacity storage.
 * - Updates in-memory cache instantly
 * - Persists to IndexedDB (supports 3,000+ questions without 5MB quota errors)
 * - Persists to localStorage when within capacity
 * - Emits egh_questions_updated event for instant UI re-render
 */
export async function saveCustomQuestions(
  newQuestions: AnyQuestion[],
  overwrite = true
): Promise<StoredQuestionItem[]> {
  if (!isClientSide() || newQuestions.length === 0) return [];

  try {
    // Warm memory cache if not loaded yet
    if (memoryQuestionsCache === null) {
      await loadCustomQuestionsAsync();
    }

    const existing = memoryQuestionsCache || [];
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

    // 1. Update memory cache immediately
    memoryQuestionsCache = merged;
    isIdbHydrated = true;

    // 2. Persist to IndexedDB (handles large datasets 3,000+ items seamlessly)
    await setIdbItem(CUSTOM_QUESTIONS_STORAGE_KEY, merged);

    // 3. Try to save to localStorage for small datasets; gracefully ignore QuotaExceededError
    if (typeof window.localStorage !== "undefined") {
      try {
        window.localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(merged));
      } catch (storageErr) {
        console.info(
          "Dataset exceeds 5MB localStorage quota; stored safely in high-capacity IndexedDB.",
          storageErr
        );
      }
    }

    // 4. Notify all components to re-render
    notifyQuestionsUpdated();

    return merged;
  } catch (err) {
    console.error("Failed to save custom questions:", err);
    return [];
  }
}

/**
 * Deletes a single custom question by ID
 */
export async function deleteCustomQuestion(id: string): Promise<void> {
  if (!isClientSide()) return;
  try {
    const existing = getCustomQuestions();
    const updated = existing.filter((q) => q.id !== id);

    memoryQuestionsCache = updated;
    await setIdbItem(CUSTOM_QUESTIONS_STORAGE_KEY, updated);

    if (typeof window.localStorage !== "undefined") {
      try {
        window.localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }

    notifyQuestionsUpdated();
  } catch (err) {
    console.error("Failed to delete custom question:", err);
  }
}

/**
 * Updates status of a custom question
 */
export async function updateCustomQuestionStatus(
  id: string,
  newStatus: "published" | "draft" | "review" | "archived"
): Promise<void> {
  if (!isClientSide()) return;
  try {
    const existing = getCustomQuestions();
    const updated = existing.map((q) => (q.id === id ? { ...q, status: newStatus } : q));

    memoryQuestionsCache = updated;
    await setIdbItem(CUSTOM_QUESTIONS_STORAGE_KEY, updated);

    if (typeof window.localStorage !== "undefined") {
      try {
        window.localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }

    notifyQuestionsUpdated();
  } catch (err) {
    console.error("Failed to update custom question status:", err);
  }
}

/**
 * Clears all custom questions or questions of a specific game type
 */
export async function clearCustomQuestions(gameType?: string): Promise<void> {
  if (!isClientSide()) return;
  try {
    if (!gameType) {
      memoryQuestionsCache = [];
      await deleteIdbItem(CUSTOM_QUESTIONS_STORAGE_KEY);
      if (typeof window.localStorage !== "undefined") {
        window.localStorage.removeItem(CUSTOM_QUESTIONS_STORAGE_KEY);
      }
    } else {
      const existing = getCustomQuestions();
      const updated = existing.filter((q) => q.game_type !== gameType);
      memoryQuestionsCache = updated;
      await setIdbItem(CUSTOM_QUESTIONS_STORAGE_KEY, updated);
      if (typeof window.localStorage !== "undefined") {
        try {
          window.localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }
    }

    notifyQuestionsUpdated();
  } catch (err) {
    console.error("Failed to clear custom questions:", err);
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
