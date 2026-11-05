import type { GameAdapter } from "@/games/types";
import {
  listenChooseQuestionSchema,
  type ListenChooseQuestion,
} from "@/lib/validations/content/listen-choose";

export interface ListenChooseAnswer {
  selectedOptionId?: string;
}

export const listenChooseAdapter: GameAdapter<ListenChooseQuestion, ListenChooseAnswer> = {
  type: "listen-choose",
  title: "Listen & Choose",
  description: "Nghe đoạn phát âm từ vựng hoặc câu đàm thoại công sở và chọn phương án đúng nhất.",
  renderKey: "listen-choose-renderer",
  validateQuestion: (q: unknown): q is ListenChooseQuestion => {
    return listenChooseQuestionSchema.safeParse(q).success;
  },
  getDefaultAnswer: () => ({
    selectedOptionId: undefined,
  }),
};

