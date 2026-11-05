import { z } from "zod";
import { baseQuestionSchema } from "./base";

export const listenOptionSchema = z.object({
  id: z.string().trim().min(1, { message: "ID phương án không được để trống." }),
  text: z.string().trim().min(1, { message: "Nội dung phương án không được để trống." }),
});

export const listenChoosePublicPayloadSchema = z
  .object({
    audioPath: z
      .string()
      .trim()
      .optional()
      .default("tts")
      .transform((val) => val || "tts"),
    speechText: z.string().trim().optional(),
    options: z
      .array(listenOptionSchema)
      .min(2, { message: "Tối thiểu 2 phương án lựa chọn." })
      .max(4, { message: "Tối đa 4 phương án lựa chọn (chuẩn 4 phương án)." }),
  })
  .strict({ message: "BẢO MẬT: Không được nhúng transcript hoặc trường lạ vào public_payload trước khi nộp bài." })
  .refine(
    (data) => {
      const ids = new Set(data.options.map((opt) => opt.id));
      return ids.size === data.options.length;
    },
    { message: "Các phương án lựa chọn phải có ID duy nhất." }
  );

export const listenChoosePrivateSolutionSchema = z.object({
  correctOptionId: z.string().trim().min(1, { message: "Phải chỉ định ID đáp án đúng." }),
  transcriptEn: z.string().trim().min(1, { message: "Transcript tiếng Anh không được để trống." }),
});

export const listenChooseQuestionSchema = baseQuestionSchema
  .extend({
    game_type: z.literal("listen-choose"),
    public_payload: listenChoosePublicPayloadSchema,
    private_solution: listenChoosePrivateSolutionSchema,
  })
  .refine(
    (data) => {
      const optionIds = data.public_payload.options.map((o) => o.id);
      return optionIds.includes(data.private_solution.correctOptionId);
    },
    {
      message: "correctOptionId phải tồn tại trong danh sách options của public_payload.",
      path: ["private_solution", "correctOptionId"],
    }
  );

export type ListenChooseQuestion = z.infer<typeof listenChooseQuestionSchema>;
export type ListenChoosePublicPayload = z.infer<typeof listenChoosePublicPayloadSchema>;
export type ListenChoosePrivateSolution = z.infer<typeof listenChoosePrivateSolutionSchema>;
