/**
 * Guest Storage Helper
 *
 * Manages client-side local storage for Guest gameplay.
 * Invariant: All progress stored here is strictly marked as UNTRUSTED and LOCAL.
 * It is never sent directly to server endpoints as trusted XP.
 */

export interface GuestProgress {
  isLocal: true;
  totalAnswered: number;
  correctCount: number;
  lastPlayedAt: string | null;
  wrongQuestionIds: string[];
}

const GUEST_STORAGE_KEY = "egh_guest_progress_v1";

const DEFAULT_GUEST_PROGRESS: GuestProgress = {
  isLocal: true,
  totalAnswered: 0,
  correctCount: 0,
  lastPlayedAt: null,
  wrongQuestionIds: [],
};

function isClientSide(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getGuestProgress(): GuestProgress {
  if (!isClientSide()) {
    return { ...DEFAULT_GUEST_PROGRESS };
  }

  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_GUEST_PROGRESS };

    const parsed = JSON.parse(raw);
    return {
      isLocal: true,
      totalAnswered: Number(parsed.totalAnswered) || 0,
      correctCount: Number(parsed.correctCount) || 0,
      lastPlayedAt: typeof parsed.lastPlayedAt === "string" ? parsed.lastPlayedAt : null,
      wrongQuestionIds: Array.isArray(parsed.wrongQuestionIds) ? parsed.wrongQuestionIds : [],
    };
  } catch {
    return { ...DEFAULT_GUEST_PROGRESS };
  }
}

export function recordGuestAnswer(questionId: string, isCorrect: boolean): GuestProgress {
  const current = getGuestProgress();
  const updated: GuestProgress = {
    ...current,
    totalAnswered: current.totalAnswered + 1,
    correctCount: isCorrect ? current.correctCount + 1 : current.correctCount,
    lastPlayedAt: new Date().toISOString(),
    wrongQuestionIds: isCorrect
      ? current.wrongQuestionIds.filter((id) => id !== questionId)
      : Array.from(new Set([...current.wrongQuestionIds, questionId])),
  };

  if (isClientSide()) {
    try {
      window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota errors or private mode restrictions
    }
  }

  return updated;
}

export function clearGuestProgress(): void {
  if (isClientSide()) {
    try {
      window.localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch {
      // Ignore errors
    }
  }
}

