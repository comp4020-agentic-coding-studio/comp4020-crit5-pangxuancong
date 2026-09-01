// Single source of truth for tempo — gameplay geometry derives its timing
// from this, not the other way around (see utils/timing.ts).
export const BPM = 112;
export const SECONDS_PER_BEAT = 60 / BPM;
