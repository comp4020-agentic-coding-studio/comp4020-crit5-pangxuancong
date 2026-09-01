// Every rhythm/game-feel tuning value lives here — nothing scattered through
// audio, rendering, or gameplay modules.
export const RHYTHM_CONFIG = {
  bpm: 118, // background/legacy grid reference only — the shipped level is beatmap-authored (music/canonTimeline.ts)

  timing: {
    perfectMs: 70,
    goodMs: 140,
  },

  particles: {
    perfectCount: 12,
    goodCount: 7,
    normalCount: 4,
    lifetimeMin: 0.55,
    lifetimeMax: 0.95,
  },

  feedback: {
    perfectCubePulse: 1.2,
    goodCubePulse: 1.13,
    normalCubePulse: 1.04,
  },

  ambience: {
    beatPulseStrength: 0.08,
    particleCount: 35,
  },

  anticipation: {
    enabled: true,
    leadMs: 180,
  },
};
