import type { Axis } from "./Axis";

// Continuous floating-point world position — never snapped to a segment
// index or a corner. Whatever happens when the player turns early or late
// has to emerge from this staying a real (x, z) point, not a discrete state.
export interface PlayerRuntime {
  x: number;
  z: number;
  axis: Axis;
}

export function initialPlayer(): PlayerRuntime {
  return { x: 0, z: 0, axis: "x" };
}
