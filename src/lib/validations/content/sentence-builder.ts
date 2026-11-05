import { z } from "zod";
import { baseQuestionSchema } from "./base";

export const tokenSchema = z.object({
  id: z.string().trim().min(1, { message: "ID từ không được để trống." }),
  text: z.string().trim().min(1, { message: "Nội dung từ không được để trống." }),
});

export const sentenceBuilderPublicPayloadSchema = z
  .object({
    promptVi: z.string().trim().min(1, { message: "Nghĩa tiếng Việt gợi ý không được để trống." }),
    tokens: z
      .array(tokenSchema)
      .min(2, { message: "Câu cần tối thiểu 2 từ/khối." })
      .max(15, { message: "Câu không vượt quá 15 từ/khối cho microlearning." }),
  })
  .refine(
    (data) => {
      const ids = new Set(data.tokens.map((t) => t.id));
      return ids.size === data.tokens.length;
    },
    { message: "Các token phải có ID duy nhất." }
  );

export const sentenceBuilderPrivateSolutionSchema = z.object({
  canonicalSequence: z
    .array(z.string().trim().min(1))
    .min(2, { message: "Thứ tự chuẩn cần ít nhất 2 từ." }),
  canonicalSentence: z.string().trim().min(1, { message: "Câu tiếng Anh hoàn chỉnh không được để trống." }),
  acceptedSequences: z.array(z.array(z.string().trim().min(1))).optional(),
});

export const sentenceBuilderQuestionSchema = baseQuestionSchema
  .extend({
    game_type: z.literal("sentence-builder"),
    public_payload: sentenceBuilderPublicPayloadSchema,
    private_solution: sentenceBuilderPrivateSolutionSchema,
  })
  .refine(
    (data) => {
      const availableTokenIds = new Set(data.public_payload.tokens.map((t) => t.id));
      const canonicalIds = data.private_solution.canonicalSequence;

      // Length must match
      if (canonicalIds.length !== data.public_payload.tokens.length) return false;

      // Every canonical ID must be a valid token ID
      for (const id of canonicalIds) {
        if (!availableTokenIds.has(id)) return false;
      }

      // Check accepted sequences if provided
      if (data.private_solution.acceptedSequences) {
        for (const seq of data.private_solution.acceptedSequences) {
          if (seq.length !== canonicalIds.length) return false;
          for (const id of seq) {
            if (!availableTokenIds.has(id)) return false;
          }
        }
      }

      return true;
    },
    {
      message: "canonicalSequence và acceptedSequences phải chứa đúng và đủ các ID của tokens trong public_payload.",
      path: ["private_solution", "canonicalSequence"],
    }
  );

export type SentenceBuilderQuestion = z.infer<typeof sentenceBuilderQuestionSchema>;
export type SentenceBuilderPublicPayload = z.infer<typeof sentenceBuilderPublicPayloadSchema>;
export type SentenceBuilderPrivateSolution = z.infer<typeof sentenceBuilderPrivateSolutionSchema>;

