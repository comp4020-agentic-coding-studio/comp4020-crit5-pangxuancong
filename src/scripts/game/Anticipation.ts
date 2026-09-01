import { RHYTHM_CONFIG } from "../config/rhythm";

// A subtle pre-turn cue (PLAN.md §29): the upcoming corner ramps toward full
// emphasis as its expected beat approaches, and drops to zero outside the
// lead window or once the moment has passed. No arrow, no text — this only
// ever feeds Platform.ts's brightness lift. Easy to disable/tune via
// RHYTHM_CONFIG.anticipation.
export function getAnticipationEmphasis(cornerTime: number, songTime: number): number {
  if (!RHYTHM_CONFIG.anticipation.enabled) return 0;

  const lead = RHYTHM_CONFIG.anticipation.leadMs / 1000;
  const timeUntil = cornerTime - songTime;
  if (timeUntil < 0 || timeUntil > lead) return 0;

  return 1 - timeUntil / lead;
}
