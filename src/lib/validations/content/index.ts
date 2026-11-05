import { z } from "zod";
import {
  memoryFlipQuestionSchema,
  type MemoryFlipQuestion,
} from "./memory-flip";
import {
  sentenceBuilderQuestionSchema,
  type SentenceBuilderQuestion,
} from "./sentence-builder";
import {
  errorDetectiveQuestionSchema,
  type ErrorDetectiveQuestion,
} from "./error-detective";
import {
  listenChooseQuestionSchema,
  type ListenChooseQuestion,
} from "./listen-choose";
import {
  roleplayQuestionSchema,
  type RoleplayQuestion,
} from "./roleplay";
import { gameTypeSchema } from "./base";

export * from "./base";
export * from "./memory-flip";
export * from "./sentence-builder";
export * from "./error-detective";
export * from "./listen-choose";
export * from "./roleplay";

export type AnyQuestion =
  | MemoryFlipQuestion
  | SentenceBuilderQuestion
  | ErrorDetectiveQuestion
  | ListenChooseQuestion
  | RoleplayQuestion;

export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export interface ValidationFailure {
  success: false;
  errors: string[];
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

/**
 * Validates a complete question object (including public_payload and private_solution)
 * against its specific GameType schema and editorial constraints.
 */
export function validateQuestion(rawQuestion: unknown): ValidationResult<AnyQuestion> {
  if (typeof rawQuestion !== "object" || rawQuestion === null) {
    return {
      success: false,
      errors: ["Dữ liệu câu hỏi phải là một object."],
    };
  }

  const rawObj = rawQuestion as Record<string, unknown>;
  const gameTypeParsed = gameTypeSchema.safeParse(rawObj.game_type);

  if (!gameTypeParsed.success) {
    return {
      success: false,
      errors: [
        `game_type không hợp lệ hoặc bị thiếu. Các loại game hợp lệ: ${gameTypeSchema.options.join(", ")}.`,
      ],
    };
  }

  let result: z.SafeParseReturnType<unknown, AnyQuestion>;

  switch (gameTypeParsed.data) {
    case "memory-flip":
      result = memoryFlipQuestionSchema.safeParse(rawQuestion);
      break;
    case "sentence-builder":
      result = sentenceBuilderQuestionSchema.safeParse(rawQuestion);
      break;
    case "error-detective":
      result = errorDetectiveQuestionSchema.safeParse(rawQuestion);
      break;
    case "listen-choose":
      result = listenChooseQuestionSchema.safeParse(rawQuestion);
      break;
    case "roleplay":
      result = roleplayQuestionSchema.safeParse(rawQuestion);
      break;
  }

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  const errors = result.error.issues.map((issue) => {
    const fieldPath = issue.path.join(".");
    return fieldPath ? `[${fieldPath}] ${issue.message}` : issue.message;
  });

  return {
    success: false,
    errors,
  };
}
