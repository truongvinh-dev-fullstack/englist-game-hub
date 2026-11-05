import type { AnyQuestion } from "@/lib/validations/content";
import { MEMORY_FLIP_SAMPLE_QUESTIONS } from "@/games/memory-flip/sample-data";
import { SENTENCE_BUILDER_SAMPLE_QUESTIONS } from "@/games/sentence-builder/sample-data";
import { ERROR_DETECTIVE_SAMPLE_QUESTIONS } from "@/games/error-detective/sample-data";
import { LISTEN_CHOOSE_SAMPLE_QUESTIONS } from "@/games/listen-choose/sample-data";
import { ROLEPLAY_SAMPLE_QUESTIONS } from "@/games/roleplay/sample-data";

export const EDITORIAL_REVIEWER_ID = "00000000-0000-0000-0000-000000000099";

/**
 * Curated editorial question bank for English Game Hub MVP.
 * All questions strictly conform to docs/CONTENT_GUIDELINES.md:
 * - Natural workplace English
 * - Concise, clear Vietnamese explanations (1-3 sentences)
 * - Defined concept tags for spaced repetition tracking
 * - Explicitly reviewed and published
 * - Zero-leakage invariant for audio transcripts
 */
export const EDITORIAL_SEED_QUESTIONS: AnyQuestion[] = [
  ...MEMORY_FLIP_SAMPLE_QUESTIONS.map((q) => ({
    ...q,
    status: "published" as const,
    reviewed_by: EDITORIAL_REVIEWER_ID,
    version: 1,
  })),
  ...SENTENCE_BUILDER_SAMPLE_QUESTIONS.map((q) => ({
    ...q,
    status: "published" as const,
    reviewed_by: EDITORIAL_REVIEWER_ID,
    version: 1,
  })),
  ...ERROR_DETECTIVE_SAMPLE_QUESTIONS.map((q) => ({
    ...q,
    status: "published" as const,
    reviewed_by: EDITORIAL_REVIEWER_ID,
    version: 1,
  })),
  ...LISTEN_CHOOSE_SAMPLE_QUESTIONS.map((q) => ({
    ...q,
    status: "published" as const,
    reviewed_by: EDITORIAL_REVIEWER_ID,
    version: 1,
  })),
  ...ROLEPLAY_SAMPLE_QUESTIONS.map((q) => ({
    ...q,
    status: "published" as const,
    reviewed_by: EDITORIAL_REVIEWER_ID,
    version: 1,
  })),
];

export function getAllEditorialQuestions(): AnyQuestion[] {
  return EDITORIAL_SEED_QUESTIONS;
}

