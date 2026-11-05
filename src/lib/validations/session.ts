import { z } from "zod";
import { difficultyLevelSchema } from "./content/base";

export const createSessionInputSchema = z.object({
  gameSlug: z.string().trim().min(1, { message: "gameSlug không được để trống." }),
  topicId: z.string().uuid().optional(),
  difficulty: difficultyLevelSchema.optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionInputSchema>;

export const submitAnswerInputSchema = z.object({
  questionId: z.string().uuid({ message: "questionId phải là UUID hợp lệ." }),
  answer: z.unknown(),
  requestId: z.string().trim().min(1, { message: "requestId là bắt buộc để đảm bảo tính lũy đẳng." }),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerInputSchema>;

