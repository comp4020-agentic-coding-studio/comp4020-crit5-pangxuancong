import type { Axis } from "./Axis";

// A segment is only ever a length in beats along one of the two positive
// axes. There is no direction-per-corner logic to derive — the axis is
// authored data, not computed from index (PLAN.md's movement correction).
export interface LevelSegment {
  axis: Axis;
  beats: number;
}

export function totalBeats(level: LevelSegment[]): number {
  return level.reduce((sum, segment) => sum + segment.beats, 0);
}
