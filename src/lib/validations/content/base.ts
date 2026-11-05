import { z } from "zod";

export const gameTypeSchema = z.enum([
  "memory-flip",
  "sentence-builder",
  "error-detective",
  "listen-choose",
  "roleplay",
]);

export const difficultyLevelSchema = z.enum(["A0", "A1", "A2", "B1"]);

export const skillTypeSchema = z.enum(["vocabulary", "grammar", "listening", "speaking"]);

export const contentStatusSchema = z.enum(["draft", "review", "published", "archived"]);

export const baseQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  topic_id: z.string().uuid({ message: "topic_id phải là UUID hợp lệ." }),
  difficulty: difficultyLevelSchema,
  skill: skillTypeSchema,
  prompt: z.string().trim().min(1, { message: "Prompt câu hỏi không được để trống." }),
  explanation_vi: z
    .string()
    .trim()
    .min(5, { message: "Giải thích tiếng Việt phải có ít nhất 5 ký tự." })
    .max(500, { message: "Giải thích tiếng Việt không quá 500 ký tự (1-3 câu)." }),
  concept_tags: z
    .array(z.string().trim().min(1))
    .min(1, { message: "Phải gắn ít nhất 1 thẻ khái niệm (concept_tags)." }),
  status: contentStatusSchema.default("draft"),
  reviewed_by: z.string().uuid().nullable().optional(),
  version: z.number().int().min(1).default(1),
});

