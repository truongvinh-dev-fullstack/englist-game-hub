import { validateQuestion, type AnyQuestion } from "./index";

export interface BatchValidationReport {
  total: number;
  validCount: number;
  invalidCount: number;
  isValid: boolean;
  gameTypeBreakdown: Record<string, number>;
  difficultyBreakdown: Record<string, number>;
  skillBreakdown: Record<string, number>;
  errors: Array<{
    index: number;
    gameType?: string;
    prompt?: string;
    issues: string[];
  }>;
}

/**
 * Validates a batch of seed questions to ensure 100% adherence to editorial guidelines
 * and schema invariants before publication to the database.
 */
export function validateSeedBatch(questions: unknown[]): BatchValidationReport {
  const report: BatchValidationReport = {
    total: questions.length,
    validCount: 0,
    invalidCount: 0,
    isValid: true,
    gameTypeBreakdown: {},
    difficultyBreakdown: {},
    skillBreakdown: {},
    errors: [],
  };

  questions.forEach((rawQ, index) => {
    const validation = validateQuestion(rawQ);

    if (validation.success) {
      report.validCount += 1;
      const q = validation.data as AnyQuestion;

      report.gameTypeBreakdown[q.game_type] = (report.gameTypeBreakdown[q.game_type] || 0) + 1;
      report.difficultyBreakdown[q.difficulty] = (report.difficultyBreakdown[q.difficulty] || 0) + 1;
      report.skillBreakdown[q.skill] = (report.skillBreakdown[q.skill] || 0) + 1;
    } else {
      report.invalidCount += 1;
      report.isValid = false;

      const typedRaw = (typeof rawQ === "object" && rawQ !== null) ? (rawQ as Record<string, unknown>) : {};
      report.errors.push({
        index,
        gameType: typeof typedRaw.game_type === "string" ? typedRaw.game_type : undefined,
        prompt: typeof typedRaw.prompt === "string" ? typedRaw.prompt : undefined,
        issues: validation.errors,
      });
    }
  });

  return report;
}

