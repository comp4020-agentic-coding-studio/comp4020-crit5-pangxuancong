import { RHYTHM_CONFIG } from "./rhythm";

// BPM lives in RHYTHM_CONFIG — this just derives the one other constant
// everything else needs, so there is exactly one number to tune.
export const BPM = RHYTHM_CONFIG.bpm;
export const SECONDS_PER_BEAT = 60 / BPM;
