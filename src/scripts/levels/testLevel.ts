import type { LevelSegment } from "../game/Level";

// Gameplay sandbox (PLAN.md §11): eight alternating positive-axis segments,
// no phases, no fading, no self-intersections. A continuously advancing
// zig-zag — the shape the movement model has to feel good on before any of
// the four-phase level design returns.
export const TEST_LEVEL: LevelSegment[] = [
  { axis: "x", beats: 4 },
  { axis: "z", beats: 3 },
  { axis: "x", beats: 5 },
  { axis: "z", beats: 2 },
  { axis: "x", beats: 4 },
  { axis: "z", beats: 4 },
  { axis: "x", beats: 2 },
  { axis: "z", beats: 5 },
];
