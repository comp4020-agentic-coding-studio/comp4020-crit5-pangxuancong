// Centralized tuning. There is no turn-window tolerance here on purpose —
// whether a click landed correctly is decided entirely by isSupported()
// against the authored road width plus a small forgiveness margin, not by
// a separate timing check (PLAN.md's movement correction, §7/§8).
export const GAMEPLAY_CONFIG = {
  baseSpeed: 140, // world units per second, always along the player's current axis
  pathWidth: 46, // visual and collision width of the road
  supportForgiveness: 10, // extra margin beyond pathWidth before the player is unsupported
  restartDelayMs: 700,
};
