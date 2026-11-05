import { z } from "zod";
import { baseQuestionSchema } from "./base";

export const memoryFlipPairSchema = z.object({
  pairId: z.string().trim().min(1, { message: "ID cặp thẻ không được để trống." }),
  en: z.string().trim().min(1, { message: "Từ tiếng Anh không được để trống." }),
  vi: z.string().trim().min(1, { message: "Nghĩa tiếng Việt không được để trống." }),
});

export const memoryFlipCardSchema = z.object({
  id: z.string().trim().min(1),
  pairId: z.string().trim().min(1),
  content: z.string().trim().min(1),
  type: z.enum(["en", "vi"]),
});

export const memoryFlipPublicPayloadSchema = z
  .object({
    pairsCount: z.number().int().min(4).max(8),
    cards: z.array(memoryFlipCardSchema).min(8).max(16),
  })
  .refine(
    (data) => {
      // Must have exactly pairsCount * 2 cards
      if (data.cards.length !== data.pairsCount * 2) return false;
      const ids = new Set(data.cards.map((c) => c.id));
      return ids.size === data.cards.length;
    },
    { message: "Số lượng thẻ phải bằng đúng số cặp x 2 và các thẻ phải có ID duy nhất." }
  );

export const memoryFlipPrivateSolutionSchema = z
  .object({
    pairs: z
      .array(memoryFlipPairSchema)
      .min(4, { message: "Memory Flip tối thiểu 4 cặp từ." })
      .max(8, { message: "Memory Flip tối đa 8 cặp từ." }),
  })
  .refine(
    (data) => {
      const pairIds = new Set(data.pairs.map((p) => p.pairId));
      return pairIds.size === data.pairs.length;
    },
    { message: "Mỗi cặp từ trong Memory Flip phải có pairId duy nhất." }
  );

export const memoryFlipQuestionSchema = baseQuestionSchema
  .extend({
    game_type: z.literal("memory-flip"),
    public_payload: memoryFlipPublicPayloadSchema,
    private_solution: memoryFlipPrivateSolutionSchema,
  })
  .refine(
    (data) => {
      const solutionPairIds = new Set(data.private_solution.pairs.map((p) => p.pairId));
      const cardPairIds = new Set(data.public_payload.cards.map((c) => c.pairId));
      if (solutionPairIds.size !== cardPairIds.size) return false;
      for (const id of solutionPairIds) {
        if (!cardPairIds.has(id)) return false;
      }
      return true;
    },
    {
      message: "Danh sách pairId giữa cards trong public_payload và pairs trong private_solution phải đồng nhất.",
      path: ["private_solution", "pairs"],
    }
  );

export type MemoryFlipQuestion = z.infer<typeof memoryFlipQuestionSchema>;
export type MemoryFlipPublicPayload = z.infer<typeof memoryFlipPublicPayloadSchema>;
export type MemoryFlipPrivateSolution = z.infer<typeof memoryFlipPrivateSolutionSchema>;

