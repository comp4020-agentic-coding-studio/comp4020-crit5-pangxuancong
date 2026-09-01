// The entire input space: two positive world axes, one click toggles which
// one the player is currently moving along. No four-direction cycle, no
// negative movement — this is what keeps the level a simple advancing
// zig-zag instead of a maze that can loop back on itself.
export type Axis = "x" | "z";

export function toggleAxis(axis: Axis): Axis {
  return axis === "x" ? "z" : "x";
}

export function axisVector(axis: Axis): { x: number; z: number } {
  return axis === "x" ? { x: 1, z: 0 } : { x: 0, z: 1 };
}
