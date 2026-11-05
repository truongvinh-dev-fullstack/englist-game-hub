import type { GameType, DifficultyLevel, SkillType, SessionStatus } from "@/lib/types/database.types";

export interface PublicQuestion {
  id: string;
  gameType: GameType;
  prompt: string;
  topicId: string;
  difficulty: DifficultyLevel;
  skill: SkillType;
  publicPayload: Record<string, unknown>;
  conceptTags: string[];
}

export interface AnswerSubmission {
  sessionId: string;
  questionId: string;
  answer: unknown;
  requestId: string;
}

export interface AnswerFeedback {
  correct: boolean;
  explanation: string;
  scoreDelta: number;
  correctAnswer?: unknown;
  nextAvailable: boolean;
}

export interface SessionSummary {
  sessionId: string;
  status: SessionStatus;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  totalXp: number;
  accuracyPercentage: number;
  startedAt: string;
  completedAt: string | null;
}

