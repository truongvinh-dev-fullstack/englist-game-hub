import type { GameType } from "@/lib/types/database.types";

export interface GameAdapter<TQuestion, TAnswer> {
  type: GameType;
  title: string;
  description: string;
  renderKey: string;
  validateQuestion: (q: unknown) => q is TQuestion;
  getDefaultAnswer?: () => TAnswer;
}
