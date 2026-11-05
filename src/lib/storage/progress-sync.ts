/**
 * Progress Synchronization & Aggregation Helper
 *
 * Provides a unified, client-safe source of truth for:
 * 1. Total User XP across all games and activities
 * 2. Daily Goal progress (sessions/stages played today)
 * 3. Skill & Level Mastery status
 * 4. Per-game stage completion status ("Đang chơi đến màn nào")
 */

import { getGuestProgress } from "./guest-storage";
import { getAllStoredRecords, getGameStageRecords, type StageRecord } from "./game-record-storage";
import { getCustomQuestionsByGame } from "./question-storage";

export interface DailyGoalStatus {
  completedCount: number;
  targetCount: number;
  isCompleted: boolean;
  percent: number;
  label: string;
}

export interface SkillProgressStatus {
  totalXp: number;
  level: number;
  levelName: string;
  levelProgressPercent: number;
  overallPercentage: number;
  label: string;
}

export interface GameProgressStatus {
  gameSlug: string;
  currentStage: number;
  highestCompletedStage: number;
  totalStages: number;
  totalQuestions: number;
  hasPlayed: boolean;
  completedStagesCount: number;
  stageDisplayBadge: string;
  actionText: string;
  targetUrl: string;
}

const PROGRESS_EVENT_NAME = "egh_progress_updated";

/**
 * Dispatches a client-side event so active headers and widgets update immediately
 */
export function notifyProgressUpdated(): void {
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    try {
      window.dispatchEvent(new CustomEvent(PROGRESS_EVENT_NAME));
    } catch {}
  }
}

/**
 * Returns the custom event name for components to subscribe to
 */
export function getProgressEventName(): string {
  return PROGRESS_EVENT_NAME;
}

/**
 * Computes total unified XP for the current user
 */
export function getUserTotalXP(): number {
  const guest = getGuestProgress();
  const guestXp = (guest.correctCount || 0) * 10;

  // Also check records stored across all stages
  const records = getAllStoredRecords();
  let recordsXp = 0;
  Object.values(records).forEach((rec: StageRecord) => {
    recordsXp += rec.bestXp || rec.bestCorrectCount * 10 || 0;
  });

  // Use the highest estimate so user progress is never reduced
  return Math.max(guestXp, recordsXp);
}

/**
 * Computes today's Daily Goal progress (target: 2 stages / sessions per day)
 */
export function getDailyGoalProgress(targetCount = 2): DailyGoalStatus {

  const todayStr = new Date().toDateString();
  const records = getAllStoredRecords();

  // Count distinct stage completions or plays that occurred today
  let todayPlaysCount = 0;
  Object.values(records).forEach((rec) => {
    if (rec.lastPlayedAt) {
      const recDate = new Date(rec.lastPlayedAt).toDateString();
      if (recDate === todayStr) {
        todayPlaysCount += Math.max(1, rec.playCount || 1);
      }
    }
  });

  // Also check guest progress: if played today and totalAnswered >= 10 questions (1 session = 10 questions)
  const guest = getGuestProgress();
  if (guest.lastPlayedAt) {
    const guestDate = new Date(guest.lastPlayedAt).toDateString();
    if (guestDate === todayStr) {
      const sessionCountFromAnswers = Math.floor((guest.totalAnswered || 0) / 10);
      todayPlaysCount = Math.max(todayPlaysCount, sessionCountFromAnswers);
    }
  }

  const completedCount = todayPlaysCount;
  const isCompleted = completedCount >= targetCount;
  const percent = Math.min(100, Math.round((completedCount / targetCount) * 100));

  let label = "";
  if (completedCount === 0) {
    label = "Chưa hoàn thành lượt chơi nào hôm nay";
  } else if (isCompleted) {
    label = `Đã hoàn thành xuất sắc mục tiêu hôm nay! (${completedCount}/${targetCount} lượt)`;
  } else {
    label = `Đã hoàn thành ${completedCount}/${targetCount} lượt chơi hôm nay`;
  }

  return {
    completedCount,
    targetCount,
    isCompleted,
    percent,
    label,
  };
}

/**
 * Computes Skill Mastery and Level based on accumulated XP
 */
export function getSkillProgressSummary(): SkillProgressStatus {
  const totalXp = getUserTotalXP();

  // Levels:
  // Level 1: 0 - 99 XP
  // Level 2: 100 - 299 XP
  // Level 3: 300 - 599 XP
  // Level 4: 600 - 999 XP
  // Level 5: 1000+ XP
  let level = 1;
  let levelName = "Sơ cấp A1";
  let minXp = 0;
  let maxXp = 100;

  if (totalXp >= 1000) {
    level = 5;
    levelName = "Chuyên gia công sở";
    minXp = 1000;
    maxXp = 2000;
  } else if (totalXp >= 600) {
    level = 4;
    levelName = "Trung cấp B2";
    minXp = 600;
    maxXp = 1000;
  } else if (totalXp >= 300) {
    level = 3;
    levelName = "Tiền trung cấp B1";
    minXp = 300;
    maxXp = 600;
  } else if (totalXp >= 100) {
    level = 2;
    levelName = "Sơ cấp A2";
    minXp = 100;
    maxXp = 300;
  }

  const range = maxXp - minXp;
  const inLevelXp = Math.max(0, totalXp - minXp);
  const levelProgressPercent = Math.min(100, Math.round((inLevelXp / range) * 100));

  // Overall curriculum completion (based on first 500 XP milestone)
  const overallPercentage = Math.min(100, Math.round((totalXp / 500) * 100));

  const label =
    totalXp === 0
      ? "Chưa có điểm kinh nghiệm, hãy bắt đầu ván đầu tiên"
      : `${totalXp} XP • Cấp độ ${level} (${levelName})`;

  return {
    totalXp,
    level,
    levelName,
    levelProgressPercent,
    overallPercentage,
    label,
  };
}

/**
 * Returns progress status and current stage for a specific game
 */
export function getGameProgressSummary(gameSlug: string): GameProgressStatus {
  const customQuestions = getCustomQuestionsByGame(gameSlug);
  const totalQuestions = customQuestions.length > 0 ? customQuestions.length : 10;
  const records = getGameStageRecords(gameSlug);
  const completedStages = Object.keys(records).map(Number);
  const highestCompletedStage = completedStages.length > 0 ? Math.max(...completedStages) : 0;
  const hasPlayed = highestCompletedStage > 0 || completedStages.length > 0;

  const baseStages = Math.max(1, Math.ceil(totalQuestions / 10));
  const totalStages = Math.max(baseStages, highestCompletedStage > 0 ? highestCompletedStage + 1 : 1);

  // Next stage to play is highest completed + 1 (capped at totalStages)
  const currentStage = hasPlayed
    ? Math.min(highestCompletedStage + 1, totalStages)
    : 1;

  let stageDisplayBadge = "";
  let actionText = "Vào chơi";

  if (!hasPlayed) {
    stageDisplayBadge = totalStages > 1 ? `Màn 1 / ${totalStages}` : "Màn 1";
    actionText = "Vào chơi";
  } else if (highestCompletedStage >= totalStages) {
    stageDisplayBadge = `🏆 Hoàn thành ${totalStages}/${totalStages} màn`;
    actionText = "Chơi lại";
  } else {
    stageDisplayBadge = `⭐ Đang ở Màn ${currentStage} / ${totalStages}`;
    actionText = `Chơi tiếp Màn ${currentStage}`;
  }

  const targetUrl = hasPlayed
    ? `/games/${gameSlug}/play?stage=${currentStage}&limit=10`
    : `/games/${gameSlug}`;

  return {
    gameSlug,
    currentStage,
    highestCompletedStage,
    totalStages,
    totalQuestions,
    hasPlayed,
    completedStagesCount: completedStages.length,
    stageDisplayBadge,
    actionText,
    targetUrl,
  };
}
