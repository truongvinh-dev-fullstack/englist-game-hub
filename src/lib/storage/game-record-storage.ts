/**
 * Game Record Storage
 *
 * Stores and manages playtime, stage completion times, and personal records
 * for mini-games in client-side localStorage.
 */

export interface StageRecord {
  gameSlug: string;
  stage: number;
  topic?: string;
  bestTimeSeconds: number;
  bestCorrectCount: number;
  totalQuestions: number;
  bestXp: number;
  lastTimeSeconds: number;
  playCount: number;
  lastPlayedAt: string;
}

export interface SaveStageRecordInput {
  gameSlug: string;
  stage: number;
  topic?: string;
  timeSeconds: number;
  correctCount: number;
  totalQuestions: number;
  xp: number;
}

export interface SaveRecordResult {
  isNewBestTime: boolean;
  isNewBestScore: boolean;
  record: StageRecord;
}

const GAME_RECORDS_STORAGE_KEY = "egh_game_records_v1";

function isClientSide(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function buildRecordKey(gameSlug: string, stage: number, topic?: string): string {
  const sanitizedTopic = topic && topic !== "all" ? topic.toLowerCase().trim() : "all";
  return `${gameSlug}:s${stage}:t_${sanitizedTopic}`;
}

/**
 * Formats seconds into digital timer display mm:ss (e.g. 01:25)
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const paddedMins = String(mins).padStart(2, "0");
  const paddedSecs = String(secs).padStart(2, "0");
  return `${paddedMins}:${paddedSecs}`;
}

/**
 * Formats seconds into friendly Vietnamese display (e.g. "1 phút 25 giây" or "45 giây")
 */
export function formatDurationVi(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "0 giây";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} giây`;
  if (secs === 0) return `${mins} phút`;
  return `${mins} phút ${secs} giây`;
}

/**
 * Retrieves all stored game records from localStorage
 */
export function getAllStoredRecords(): Record<string, StageRecord> {
  if (!isClientSide()) return {};
  try {
    const raw = window.localStorage.getItem(GAME_RECORDS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Retrieves the record for a specific stage of a game
 */
export function getStageRecord(
  gameSlug: string,
  stage: number,
  topic?: string
): StageRecord | null {
  const records = getAllStoredRecords();
  const key = buildRecordKey(gameSlug, stage, topic);
  return records[key] || null;
}

/**
 * Retrieves all stage records for a specific game slug (keyed by stage number)
 */
export function getGameStageRecords(gameSlug: string): Record<number, StageRecord> {
  const all = getAllStoredRecords();
  const result: Record<number, StageRecord> = {};

  Object.values(all).forEach((rec) => {
    if (rec.gameSlug === gameSlug) {
      // Keep best record per stage
      const existing = result[rec.stage];
      if (!existing || rec.bestTimeSeconds < existing.bestTimeSeconds) {
        result[rec.stage] = rec;
      }
    }
  });

  return result;
}

/**
 * Saves or updates a stage record, detecting if it sets a new personal record
 */
export function saveStageRecord(input: SaveStageRecordInput): SaveRecordResult {
  const key = buildRecordKey(input.gameSlug, input.stage, input.topic);
  const allRecords = getAllStoredRecords();
  const previous = allRecords[key];

  let isNewBestTime = false;
  let isNewBestScore = false;

  const validTime = Math.max(1, Math.round(input.timeSeconds));
  const validCorrect = Math.max(0, input.correctCount);

  if (!previous) {
    isNewBestTime = true;
    isNewBestScore = true;
  } else {
    // A new best time is achieved if current time is lower AND accuracy was at least equal
    if (previous.bestTimeSeconds === 0 || validTime < previous.bestTimeSeconds) {
      isNewBestTime = true;
    }
    if (validCorrect > previous.bestCorrectCount) {
      isNewBestScore = true;
    }
  }

  const updatedRecord: StageRecord = {
    gameSlug: input.gameSlug,
    stage: input.stage,
    topic: input.topic,
    bestTimeSeconds: previous
      ? isNewBestTime
        ? validTime
        : previous.bestTimeSeconds
      : validTime,
    bestCorrectCount: previous
      ? Math.max(previous.bestCorrectCount, validCorrect)
      : validCorrect,
    totalQuestions: input.totalQuestions,
    bestXp: previous ? Math.max(previous.bestXp, input.xp) : input.xp,
    lastTimeSeconds: validTime,
    playCount: (previous?.playCount || 0) + 1,
    lastPlayedAt: new Date().toISOString(),
  };

  allRecords[key] = updatedRecord;

  if (isClientSide()) {
    try {
      window.localStorage.setItem(GAME_RECORDS_STORAGE_KEY, JSON.stringify(allRecords));
    } catch (err) {
      console.warn("Failed to persist stage record:", err);
    }
  }

  return {
    isNewBestTime,
    isNewBestScore,
    record: updatedRecord,
  };
}

/**
 * Clears all stage records (useful for test isolation)
 */
export function clearStageRecords(): void {
  if (isClientSide()) {
    try {
      window.localStorage.removeItem(GAME_RECORDS_STORAGE_KEY);
    } catch {}
  }
}

