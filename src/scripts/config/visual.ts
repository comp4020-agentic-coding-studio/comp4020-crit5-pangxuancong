// Gameplay sandbox (PLAN.md §11): fog/visibility phases are postponed along
// with everything else that isn't core movement feel. This file will grow
// a visibility horizon again once the four-phase level returns.
export const VISUAL_CONFIG = {
  background: "#0a0c12",
  platformTop: "#e7ecf5",
  platformSide: "#3a4050",
  player: "#9be8d8",
  playerSide: "#4f9a8c",
  playerFallen: "#4a5560",
  trail: "rgba(155, 232, 216, 0.55)",
};

// Platform thickness is a rendering-only height offset, not a gameplay
// coordinate — collision never reads it (PLAN.md's movement correction, §3).
export const PLATFORM_THICKNESS = 12;
export const TRAIL_WIDTH = 4;
export const PLAYER_SIZE = 13; // half-extent of the player cube's footprint
export const PLAYER_HEIGHT = 16;
