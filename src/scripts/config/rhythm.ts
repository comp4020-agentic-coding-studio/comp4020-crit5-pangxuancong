// Every rhythm/game-feel tuning value lives here — nothing scattered through
// audio, rendering, or gameplay modules.
export const RHYTHM_CONFIG = {
  bpm: 118,

  timing: {
    perfectMs: 70,
    goodMs: 130,
  },

  particles: {
    perfectCount: 6,
    goodCount: 4,
    normalCount: 1,
    lifetimeMin: 0.4,
    lifetimeMax: 0.8,
  },

  feedback: {
    perfectCubePulse: 1.12,
    goodCubePulse: 1.07,
    normalCubePulse: 1.03,
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
