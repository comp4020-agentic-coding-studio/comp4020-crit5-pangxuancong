// Centralized tuning. The turn tolerances and support forgiveness are the
// values a playtesting pass is expected to adjust — see PROCESS.md.
export const GAMEPLAY_CONFIG = {
  baseSpeed: 140, // world units per second
  turnToleranceBefore: 34, // world units before a corner where a click still registers
  turnToleranceAfter: 16, // world units after a corner where a late click still registers
  supportForgiveness: 10, // extra margin past turnToleranceAfter before the player is considered off-path
  restartDelayMs: 700,
  pathWidth: 48,
};
