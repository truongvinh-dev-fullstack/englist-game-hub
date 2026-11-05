import type { GameAdapter } from "@/games/types";
import {
  memoryFlipQuestionSchema,
  type MemoryFlipQuestion,
} from "@/lib/validations/content/memory-flip";

export interface MemoryFlipAnswer {
  matchedPairsCount: number;
  isBoardCleared: boolean;
}

export const memoryFlipAdapter: GameAdapter<MemoryFlipQuestion, MemoryFlipAnswer> = {
  type: "memory-flip",
  title: "Memory Flip",
  description: "Lật các thẻ bài từ vựng và ghép đúng với nghĩa tiếng Việt tương ứng.",
  renderKey: "memory-flip-renderer",
  validateQuestion: (q: unknown): q is MemoryFlipQuestion => {
    return memoryFlipQuestionSchema.safeParse(q).success;
  },
  getDefaultAnswer: () => ({
    matchedPairsCount: 0,
    isBoardCleared: false,
  }),
};

