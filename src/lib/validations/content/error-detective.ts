import { z } from "zod";
import { baseQuestionSchema } from "./base";

export const sentenceSegmentSchema = z.object({
  id: z.string().trim().min(1, { message: "ID phân đoạn không được để trống." }),
  text: z.string().trim().min(1, { message: "Nội dung phân đoạn không được để trống." }),
});

export const correctionOptionSchema = z.object({
  id: z.string().trim().min(1, { message: "ID phương án sửa không được để trống." }),
  text: z.string().trim().min(1, { message: "Nội dung phương án sửa không được để trống." }),
});

export const errorDetectivePublicPayloadSchema = z
  .object({
    sentence: z.string().trim().min(1, { message: "Câu bài tập không được để trống." }),
    segments: z
      .array(sentenceSegmentSchema)
      .min(2, { message: "Câu cần tối thiểu 2 phân đoạn để phát hiện lỗi." })
      .max(10, { message: "Câu không quá 10 phân đoạn." }),
    correctionOptions: z
      .array(correctionOptionSchema)
      .min(2, { message: "Cần tối thiểu 2 lựa chọn sửa lỗi." })
      .max(4, { message: "Tối đa 4 lựa chọn sửa lỗi." }),
  })
  .refine(
    (data) => {
      const segIds = new Set(data.segments.map((s) => s.id));
      const optIds = new Set(data.correctionOptions.map((o) => o.id));
      return segIds.size === data.segments.length && optIds.size === data.correctionOptions.length;
    },
    { message: "Các segment và correctionOptions phải có ID duy nhất." }
  );

export const errorDetectivePrivateSolutionSchema = z.object({
  errorSegmentId: z.string().trim().min(1, { message: "Phải chỉ định ID phân đoạn chứa lỗi." }),
  correctOptionId: z.string().trim().min(1, { message: "Phải chỉ định ID phương án sửa đúng." }),
  grammarConcept: z.string().trim().min(1, { message: "Phải nêu rõ điểm ngữ pháp lỗi." }),
  correctedSentence: z.string().trim().min(1, { message: "Câu hoàn chỉnh sau khi sửa không được để trống." }),
});

export const errorDetectiveQuestionSchema = baseQuestionSchema
  .extend({
    game_type: z.literal("error-detective"),
    public_payload: errorDetectivePublicPayloadSchema,
    private_solution: errorDetectivePrivateSolutionSchema,
  })
  .refine(
    (data) => {
      const segmentIds = data.public_payload.segments.map((s) => s.id);
      return segmentIds.includes(data.private_solution.errorSegmentId);
    },
    {
      message: "errorSegmentId phải tồn tại trong danh sách segments của public_payload.",
      path: ["private_solution", "errorSegmentId"],
    }
  )
  .refine(
    (data) => {
      const optionIds = data.public_payload.correctionOptions.map((o) => o.id);
      return optionIds.includes(data.private_solution.correctOptionId);
    },
    {
      message: "correctOptionId phải tồn tại trong danh sách correctionOptions của public_payload.",
      path: ["private_solution", "correctOptionId"],
    }
  );

export type ErrorDetectiveQuestion = z.infer<typeof errorDetectiveQuestionSchema>;
export type ErrorDetectivePublicPayload = z.infer<typeof errorDetectivePublicPayloadSchema>;
export type ErrorDetectivePrivateSolution = z.infer<typeof errorDetectivePrivateSolutionSchema>;

