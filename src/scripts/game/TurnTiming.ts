import { RHYTHM_CONFIG } from "../config/rhythm";

export type TimingGrade = "perfect" | "good" | "normal";

// Rhythm quality is judged separately from gameplay success (PLAN.md §11):
// this only ever controls feedback intensity, never whether the player
// survives a turn.
export function getTimingGrade(errorSeconds: number): TimingGrade {
  const errorMs = errorSeconds * 1000;
  if (errorMs <= RHYTHM_CONFIG.timing.perfectMs) return "perfect";
  if (errorMs <= RHYTHM_CONFIG.timing.goodMs) return "good";
  return "normal";
}
