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

// Beat index (from level start) at which each segment's corner falls —
// used only for the optional turn-anticipation cue (PLAN.md §29), never for
// collision or survival.
export function cornerBeatIndices(level: LevelSegment[]): number[] {
  const indices: number[] = [];
  let cumulative = 0;
  for (const segment of level) {
    cumulative += segment.beats;
    indices.push(cumulative);
  }
  return indices;
}
