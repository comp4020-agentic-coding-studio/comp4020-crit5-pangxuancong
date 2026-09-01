import { PHASE_BOUNDARIES } from "../levels/level01";
import { clamp, lerp } from "../utils/math";

export const VISUAL_CONFIG = {
  background: "#0a0c12",
  platformTop: "#e7ecf5",
  platformSide: "#3a4050",
  player: "#9be8d8",
  playerSide: "#4f9a8c",
  playerFallen: "#4a5560",
  trail: "rgba(155, 232, 216, 0.55)",
  fogNear: 900, // world units of clear visibility during phase 1/2
  fogFar: 220, // world units of clear visibility by the end of phase 4
};

// Platform geometry: a suspended slab, not a stroked line — see PLAN.md's
// rendering redesign. Thickness is a rendering-only world-Z offset, not part
// of gameplay state.
export const PLATFORM_WIDTH = 46;
export const PLATFORM_THICKNESS = 12;
export const TRAIL_WIDTH = 4;
export const PLAYER_SIZE = 13; // half-extent of the player cube's footprint
export const PLAYER_HEIGHT = 16;

// Progressive information loss (PLAN.md §11 Phase 3/4): how far ahead of the
// player the path is fully visible. Phases 1–2 show everything useful;
// phase 3 fades the horizon in; phase 4 holds it at its shortest.
export function visibilityHorizon(segmentIndex: number): number {
  if (segmentIndex <= PHASE_BOUNDARIES.reactPredict) return VISUAL_CONFIG.fogNear;
  if (segmentIndex >= PHASE_BOUNDARIES.listen) return VISUAL_CONFIG.fogFar;

  const span = PHASE_BOUNDARIES.listen - PHASE_BOUNDARIES.reactPredict;
  const progress = clamp((segmentIndex - PHASE_BOUNDARIES.reactPredict) / span, 0, 1);
  return lerp(VISUAL_CONFIG.fogNear, VISUAL_CONFIG.fogFar, progress);
}
