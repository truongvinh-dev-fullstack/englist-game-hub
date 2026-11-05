import type { GameAdapter } from "@/games/types";
import {
  errorDetectiveQuestionSchema,
  type ErrorDetectiveQuestion,
} from "@/lib/validations/content/error-detective";

export interface ErrorDetectiveAnswer {
  selectedSegmentId?: string;
  selectedOptionId?: string;
}

export const errorDetectiveAdapter: GameAdapter<ErrorDetectiveQuestion, ErrorDetectiveAnswer> = {
  type: "error-detective",
  title: "Error Detective",
  description: "Tìm điểm sai ngữ pháp trong câu văn bản và chọn phương án sửa chính xác nhất.",
  renderKey: "error-detective-renderer",
  validateQuestion: (q: unknown): q is ErrorDetectiveQuestion => {
    return errorDetectiveQuestionSchema.safeParse(q).success;
  },
  getDefaultAnswer: () => ({
    selectedSegmentId: undefined,
    selectedOptionId: undefined,
  }),
};

