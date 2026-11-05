import type { GameAdapter } from "@/games/types";
import {
  roleplayQuestionSchema,
  type RoleplayQuestion,
} from "@/lib/validations/content/roleplay";

export interface RoleplayAnswer {
  selectedChoiceId?: string;
}

export const roleplayAdapter: GameAdapter<RoleplayQuestion, RoleplayAnswer> = {
  type: "roleplay",
  title: "Roleplay Simulator",
  description: "Mô phỏng hội thoại công sở theo kịch bản: chọn câu phản hồi khéo léo và chuyên nghiệp nhất.",
  renderKey: "roleplay-renderer",
  validateQuestion: (q: unknown): q is RoleplayQuestion => {
    return roleplayQuestionSchema.safeParse(q).success;
  },
  getDefaultAnswer: () => ({
    selectedChoiceId: undefined,
  }),
};

