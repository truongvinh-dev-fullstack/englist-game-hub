import { z } from "zod";
import { baseQuestionSchema } from "./base";

export const roleplayRatingSchema = z.enum(["appropriate", "acceptable", "inappropriate"]);

export const roleplayChoiceSchema = z.object({
  id: z.string().trim().min(1, { message: "ID lựa chọn không được để trống." }),
  text: z.string().trim().min(1, { message: "Lời thoại phản hồi không được để trống." }),
  nextNodeId: z.string().trim().optional(),
});

export const roleplayEvaluationSchema = z.object({
  choiceId: z.string().trim().min(1),
  rating: roleplayRatingSchema,
  scoreDelta: z.number().int().min(0).max(10),
  feedbackVi: z.string().trim().min(5, { message: "Nhận xét tiếng Việt phải có ít nhất 5 ký tự." }),
});

export const roleplayPublicPayloadSchema = z
  .object({
    situation: z.string().trim().min(1, { message: "Mô tả bối cảnh tình huống không được để trống." }),
    npcRole: z.string().trim().min(1, { message: "Vai của nhân vật giao tiếp (NPC) không được để trống." }),
    npcText: z.string().trim().min(1, { message: "Lời thoại của NPC không được để trống." }),
    choices: z
      .array(roleplayChoiceSchema)
      .min(2, { message: "Mỗi lượt thoại cần tối thiểu 2 lựa chọn phản hồi." })
      .max(4, { message: "Mỗi lượt thoại tối đa 4 lựa chọn phản hồi." }),
    isTerminal: z.boolean().default(false),
  })
  .refine(
    (data) => {
      const ids = new Set(data.choices.map((c) => c.id));
      return ids.size === data.choices.length;
    },
    { message: "Các lựa chọn phản hồi phải có ID duy nhất." }
  );

export const roleplayPrivateSolutionSchema = z
  .object({
    evaluations: z
      .array(roleplayEvaluationSchema)
      .min(2, { message: "Phải có tiêu chí đánh giá cho từng lựa chọn." }),
  })
  .refine(
    (data) => {
      const ids = new Set(data.evaluations.map((e) => e.choiceId));
      return ids.size === data.evaluations.length;
    },
    { message: "Mỗi tiêu chí đánh giá phải ứng với một choiceId duy nhất." }
  );

export const roleplayQuestionSchema = baseQuestionSchema
  .extend({
    game_type: z.literal("roleplay"),
    public_payload: roleplayPublicPayloadSchema,
    private_solution: roleplayPrivateSolutionSchema,
  })
  .refine(
    (data) => {
      const choiceIds = new Set(data.public_payload.choices.map((c) => c.id));
      const evaluatedIds = new Set(data.private_solution.evaluations.map((e) => e.choiceId));

      if (choiceIds.size !== evaluatedIds.size) return false;
      for (const id of choiceIds) {
        if (!evaluatedIds.has(id)) return false;
      }
      return true;
    },
    {
      message: "Tất cả choices trong public_payload phải có đánh giá tương ứng trong private_solution.evaluations.",
      path: ["private_solution", "evaluations"],
    }
  );

export type RoleplayQuestion = z.infer<typeof roleplayQuestionSchema>;
export type RoleplayPublicPayload = z.infer<typeof roleplayPublicPayloadSchema>;
export type RoleplayPrivateSolution = z.infer<typeof roleplayPrivateSolutionSchema>;
export type RoleplayRating = z.infer<typeof roleplayRatingSchema>;

