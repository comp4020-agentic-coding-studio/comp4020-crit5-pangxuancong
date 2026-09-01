import { axisVector } from "./Axis";
import type { PlayerRuntime } from "./Player";
import { lerp } from "../utils/math";

const SMOOTHING = 0.08;
const AXIS_LEAD = 220; // world units of lead along the player's current axis
const DIAGONAL_LEAD = 130; // additional lead along the level's general (+x, +z) direction
const MICRO_PUSH = 14; // world units of extra forward emphasis at full pulse strength

export interface Camera {
  x: number;
  z: number;
}

export function initialCamera(): Camera {
  return { x: 0, z: 0 };
}

// Looks ahead by combining the player's current movement direction with the
// level's general forward direction (+x, +z) — the level only ever advances
// that way, so this keeps more of the upcoming route on screen than a pure
// per-axis lead would, without zooming out to reveal the whole level.
//
// `pulse` (0..1, decaying) is the only camera response a correct turn gets:
// a brief forward emphasis, never a shake, never large enough to disturb
// path readability (PLAN.md §15).
export function updateCamera(camera: Camera, player: PlayerRuntime, pulse = 0): Camera {
  const along = axisVector(player.axis);
  const push = MICRO_PUSH * pulse;
  const leadX = along.x * (AXIS_LEAD + push) + DIAGONAL_LEAD;
  const leadZ = along.z * (AXIS_LEAD + push) + DIAGONAL_LEAD;

  return {
    x: lerp(camera.x, player.x + leadX, SMOOTHING),
    z: lerp(camera.z, player.z + leadZ, SMOOTHING),
  };
}
