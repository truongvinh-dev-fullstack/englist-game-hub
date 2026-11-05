import type { GameAdapter } from "@/games/types";
import {
  sentenceBuilderQuestionSchema,
  type SentenceBuilderQuestion,
} from "@/lib/validations/content/sentence-builder";

export interface SentenceBuilderAnswer {
  tokenSequence: string[];
}

export const sentenceBuilderAdapter: GameAdapter<SentenceBuilderQuestion, SentenceBuilderAnswer> = {
  type: "sentence-builder",
  title: "Sentence Builder",
  description: "Sắp xếp các khối từ thành câu hoàn chỉnh đúng cấu trúc ngữ pháp tiếng Anh.",
  renderKey: "sentence-builder-renderer",
  validateQuestion: (q: unknown): q is SentenceBuilderQuestion => {
    return sentenceBuilderQuestionSchema.safeParse(q).success;
  },
  getDefaultAnswer: () => ({
    tokenSequence: [],
  }),
};

