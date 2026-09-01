import { RHYTHM_CONFIG } from "../config/rhythm";
import { getBeatIndex, getBeatPhase, type RhythmClock } from "./RhythmClock";

const STRONG = 1;
const MEDIUM = 0.55;
const WEAK = 0.22;

// Beat 1 of the bar reads as strong, beat 3 medium, beats 2 and 4 weak — the
// environment reacts primarily to strong/medium beats, not every
// subdivision equally (PLAN.md §27).
function beatStrength(beatIndex: number): number {
  const beatInBar = ((beatIndex % 4) + 4) % 4;
  if (beatInBar === 0) return STRONG;
  if (beatInBar === 2) return MEDIUM;
  return WEAK;
}

// Derived straight from the shared RhythmClock every frame rather than from
// a scheduler callback — the visual pulse and the audio it echoes read the
// same clock, so they can never drift apart (PLAN.md §26).
export function getBeatPulse(clock: RhythmClock): number {
  const beatIndex = getBeatIndex(clock);
  const phase = getBeatPhase(clock);
  const envelope = Math.exp(-6 * phase);
  return beatStrength(beatIndex) * envelope * RHYTHM_CONFIG.ambience.beatPulseStrength;
}
