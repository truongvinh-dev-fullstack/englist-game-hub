export const BASE_QUESTION_XP = 10;
export const MAX_SESSION_XP_CAP = 100;

/**
 * Calculates and bounds session XP to prevent anomalous or fraudulent scores.
 */
export function calculateBoundedXP(currentXp: number, delta: number): number {
  const safeCurrent = Math.max(0, currentXp);
  const safeDelta = Math.max(0, delta);
  return Math.min(safeCurrent + safeDelta, MAX_SESSION_XP_CAP);
}

